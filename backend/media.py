"""Read-only inspection of the original video files (never modified).

Parses the (fragmented) MP4 container to report duration, frame rate and keyframe spacing,
which the frontend uses to choose a scroll-scrub vs. playback strategy.
"""
from __future__ import annotations

import hashlib
import json
import os
import struct
from functools import lru_cache

from .config import HERO_VIDEO_PATH, MEDIA_FINGERPRINTS_PATH, SCROLL_VIDEO_PATH

VIDEOS = {
    "hero": {"path": HERO_VIDEO_PATH, "url": "/videos/hero", "credit": "Original HMX landing-page film supplied with the project."},
    "scroll": {
        "path": SCROLL_VIDEO_PATH,
        "url": "/videos/scroll",
        "credit": "FPV drone house tour — Frimm Immobiliare Sardegna / salva.tours (as named in the supplied file).",
    },
}


def _boxes(f, start, end):
    f.seek(start)
    while f.tell() < end:
        pos = f.tell()
        hdr = f.read(8)
        if len(hdr) < 8:
            break
        size, typ = struct.unpack(">I4s", hdr)
        h = 8
        if size == 1:
            size = struct.unpack(">Q", f.read(8))[0]
            h = 16
        elif size == 0:
            size = end - pos
        if size < h:
            break
        yield typ.decode("latin1"), pos, size, h
        f.seek(pos + size)


def _full_header_time(f, pos, h):
    f.seek(pos + h)
    version = f.read(1)[0]
    f.read(3)
    f.read(16 if version == 1 else 8)
    timescale = struct.unpack(">I", f.read(4))[0]
    duration = struct.unpack(">Q" if version == 1 else ">I", f.read(8 if version == 1 else 4))[0]
    return timescale, duration


@lru_cache(maxsize=4)
def inspect_mp4(path: str) -> dict:
    size = os.path.getsize(path)
    info: dict = {"container": "mp4", "fragmented": False}
    with open(path, "rb") as f:
        top = list(_boxes(f, 0, size))
        names = [t for t, *_ in top]
        info["fragmented"] = "moof" in names
        info["faststart"] = "moov" in names and "mdat" in names and names.index("moov") < names.index("mdat")
        moov = next((b for b in top if b[0] == "moov"), None)
        if not moov:
            return info
        tracks = {}
        trex = {}
        for t, pos, sz, h in _boxes(f, moov[1] + moov[3], moov[1] + moov[2]):
            if t == "mvex":
                for tt, pp, ss, hh in _boxes(f, pos + h, pos + sz):
                    if tt == "trex":
                        f.seek(pp + hh + 4)
                        tid, _, dur, _, flags = struct.unpack(">IIIII", f.read(20))
                        trex[tid] = (dur, flags)
            if t == "trak":
                tr: dict = {}
                for tt, pp, ss, hh in _boxes(f, pos + h, pos + sz):
                    if tt == "tkhd":
                        f.seek(pp + hh)
                        v = f.read(1)[0]
                        f.read(3)
                        f.read(16 if v == 1 else 8)
                        tr["id"] = struct.unpack(">I", f.read(4))[0]
                    if tt == "mdia":
                        for t3, p3, s3, h3 in _boxes(f, pp + hh, pp + ss):
                            if t3 == "mdhd":
                                tr["timescale"], tr["duration"] = _full_header_time(f, p3, h3)
                            if t3 == "hdlr":
                                f.seek(p3 + h3 + 8)
                                tr["handler"] = f.read(4).decode("latin1")
                            if t3 == "minf":
                                for t4, p4, s4, h4 in _boxes(f, p3 + h3, p3 + s3):
                                    if t4 == "stbl":
                                        for t5, p5, s5, h5 in _boxes(f, p4 + h4, p4 + s4):
                                            if t5 == "stsd":
                                                f.seek(p5 + h5 + 12)
                                                tr["codec"] = f.read(4).decode("latin1")
                                                if tr.get("handler") == "vide":
                                                    f.read(24)
                                                    w, hh2 = struct.unpack(">HH", f.read(4))
                                                    tr["width"], tr["height"] = w, hh2
                tracks[tr.get("id")] = tr
        video = next((t for t in tracks.values() if t.get("handler") == "vide"), None)
        if not video:
            return info
        info.update({"codec": video.get("codec"), "width": video.get("width"), "height": video.get("height")})
        vid, vts = video["id"], video["timescale"]
        total = frames = keys = 0
        if info["fragmented"]:
            for t, pos, sz, h in top:
                if t != "moof":
                    continue
                for tt, pp, ss, hh in _boxes(f, pos + h, pos + sz):
                    if tt != "traf":
                        continue
                    tid = None
                    d_dur, d_flags = trex.get(vid, (0, 0))
                    for t3, p3, s3, h3 in _boxes(f, pp + hh, pp + ss):
                        f.seek(p3 + h3)
                        if t3 == "tfhd":
                            fl = struct.unpack(">I", f.read(4))[0] & 0xFFFFFF
                            tid = struct.unpack(">I", f.read(4))[0]
                            if fl & 0x01: f.read(8)
                            if fl & 0x02: f.read(4)
                            if fl & 0x08: d_dur = struct.unpack(">I", f.read(4))[0]
                            if fl & 0x10: f.read(4)
                            if fl & 0x20: d_flags = struct.unpack(">I", f.read(4))[0]
                        if t3 == "trun" and tid == vid:
                            fl = struct.unpack(">I", f.read(4))[0] & 0xFFFFFF
                            count = struct.unpack(">I", f.read(4))[0]
                            if fl & 0x01: f.read(4)
                            first = struct.unpack(">I", f.read(4))[0] if fl & 0x04 else None
                            for i in range(count):
                                dur, sflags = d_dur, d_flags
                                if fl & 0x100: dur = struct.unpack(">I", f.read(4))[0]
                                if fl & 0x200: f.read(4)
                                if fl & 0x400: sflags = struct.unpack(">I", f.read(4))[0]
                                if fl & 0x800: f.read(4)
                                if i == 0 and first is not None: sflags = first
                                if not (sflags >> 16) & 1: keys += 1
                                total += dur
                            frames += count
        else:
            total = video.get("duration", 0)
        if vts and total:
            info["duration_s"] = round(total / vts, 3)
            if frames:
                info["fps"] = round(frames / (total / vts), 3)
                info["frames"] = frames
            if keys:
                info["keyframes"] = keys
                info["avg_keyframe_interval_s"] = round((total / vts) / keys, 3)
    # Strategy hint: per-frame scroll scrubbing requires dense keyframes.
    interval = info.get("avg_keyframe_interval_s")
    info["scrub_suitability"] = (
        "good" if interval is not None and interval <= 0.5 else
        "limited" if interval is not None and interval <= 2.5 else
        "poor" if interval is not None else "unknown"
    )
    return info


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def media_metadata() -> dict:
    out = {}
    for key, v in VIDEOS.items():
        exists = os.path.exists(v["path"])
        out[key] = {
            "url": v["url"],
            "exists": exists,
            "bytes": os.path.getsize(v["path"]) if exists else None,
            "credit": v["credit"],
            "container": inspect_mp4(v["path"]) if exists else None,
        }
    return out


def verify_fingerprints() -> dict:
    with open(MEDIA_FINGERPRINTS_PATH, "r", encoding="utf-8") as fh:
        recorded = json.load(fh)["files"]
    results = {}
    for key, v in VIDEOS.items():
        rec = recorded[key]
        if not os.path.exists(v["path"]):
            results[key] = {"exists": False, "identical": False}
            continue
        actual = sha256_file(v["path"])
        results[key] = {
            "exists": True,
            "recorded_sha256": rec["sha256"],
            "current_sha256": actual,
            "recorded_bytes": rec["bytes"],
            "current_bytes": os.path.getsize(v["path"]),
            "identical": actual == rec["sha256"] and os.path.getsize(v["path"]) == rec["bytes"],
        }
    return {"all_identical": all(r["identical"] for r in results.values()), "files": results}
