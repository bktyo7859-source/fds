"""
HMX Real Estate Intelligence Platform — FastAPI Backend
Provides live ML inference, dataset property exploration, analytics,
video streaming with HTTP Range support, and model card verification.
"""

import os
import re
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import HERO_VIDEO_PATH, CINEMATIC_HERO_PATH, SCROLL_VIDEO_PATH, IMAGES_DIR
from .model import engine
from .properties import property_store
from .media import media_metadata, verify_fingerprints
from .reports import compute_report_hash

app = FastAPI(
    title="HMX Real Estate Intelligence API",
    description="Enterprise machine learning valuation engine, property analytics, and spatial terminal",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure assets/images directory exists and is mounted
os.makedirs(IMAGES_DIR, exist_ok=True)
app.mount("/assets/images", StaticFiles(directory=IMAGES_DIR), name="assets")


def range_requests_response(
    request: Request, file_path: str, content_type: str = "video/mp4"
):
    """Serve media files supporting HTTP 206 Partial Content (Range requests) for smooth seeking."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Media file not found")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")

    if not range_header:
        def iterfile_full():
            with open(file_path, mode="rb") as file_like:
                while chunk := file_like.read(1024 * 1024):
                    yield chunk

        headers = {
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=86400",
        }
        return StreamingResponse(iterfile_full(), status_code=200, headers=headers)

    range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
    if not range_match:
        raise HTTPException(status_code=416, detail="Invalid Range Header")

    start = int(range_match.group(1))
    end = int(range_match.group(2)) if range_match.group(2) else file_size - 1

    if start >= file_size or end >= file_size:
        raise HTTPException(status_code=416, detail="Range Not Satisfiable")

    content_length = (end - start) + 1

    def iterfile_range():
        with open(file_path, mode="rb") as file_like:
            file_like.seek(start)
            bytes_left = content_length
            chunk_size = 1024 * 512
            while bytes_left > 0:
                current_chunk = min(chunk_size, bytes_left)
                data = file_like.read(current_chunk)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(content_length),
        "Content-Type": content_type,
        "Cache-Control": "public, max-age=86400",
    }
    return StreamingResponse(iterfile_range(), status_code=206, headers=headers)


@app.get("/")
def root():
    return {
        "platform": "HMX — Real Estate Intelligence",
        "tagline": "Homes, Understood.",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_rows": len(property_store.df),
        "ml_model_loaded": engine.ready,
        "model_version": engine.version if engine.ready else None,
        "hero_video_exists": os.path.exists(HERO_VIDEO_PATH),
        "scroll_video_exists": os.path.exists(SCROLL_VIDEO_PATH),
        "media_integrity": verify_fingerprints(),
        "metrics": engine.card.get("metrics") if engine.card else None
    }


@app.get("/api/model/card")
def get_model_card():
    if not engine.card:
        raise HTTPException(status_code=503, detail="Model card unavailable")
    return engine.card


@app.get("/api/media")
def get_media_info():
    return media_metadata()


@app.get("/api/media/verify")
def get_media_verification():
    return verify_fingerprints()


# Video streaming endpoints
@app.get("/videos/hero")
def stream_hero_video(request: Request):
    """Stream preserved landing page hero video with full Range seeking support."""
    return range_requests_response(request, HERO_VIDEO_PATH)


@app.get("/videos/cinematic")
def stream_cinematic_video(request: Request):
    """Stream user-added 8K cinematic night aerial video with full Range seeking support."""
    return range_requests_response(request, CINEMATIC_HERO_PATH)


@app.get("/videos/scroll")
def stream_scroll_video(request: Request):
    """Stream preserved scroll-down drone house tour video with full Range seeking support."""
    return range_requests_response(request, SCROLL_VIDEO_PATH)


# Property Exploration Endpoints
@app.get("/api/properties")
def get_properties(
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    bedrooms: Optional[int] = Query(None, description="Minimum bedrooms"),
    bathrooms: Optional[int] = Query(None, description="Minimum bathrooms"),
    furnishing: Optional[str] = Query("all", description="Furnishing status filter"),
    prefarea: Optional[str] = Query("all", description="Preferred area filter"),
    airconditioning: Optional[str] = Query("all", description="AC filter"),
    sort: str = Query("price_desc", description="Sort order"),
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    return property_store.list(
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        furnishing=furnishing,
        prefarea=prefarea,
        airconditioning=airconditioning,
        sort=sort,
        limit=limit,
        offset=offset
    )


@app.get("/api/properties/{property_id}")
def get_property_detail(property_id: int):
    detail = property_store.get(property_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Property record #{property_id} not found")
    return detail


# Machine Learning Prediction Request
class ValuationRequest(BaseModel):
    area: float = Field(..., ge=500, le=50000, description="Built-up area in square feet")
    bedrooms: int = Field(..., ge=1, le=10, description="Total bedrooms")
    bathrooms: int = Field(..., ge=1, le=6, description="Total bathrooms")
    stories: int = Field(..., ge=1, le=6, description="Total stories/floors")
    parking: int = Field(..., ge=0, le=10, description="Allocated parking spaces")
    mainroad: str = Field("yes", pattern="^(yes|no)$", description="Direct main road access")
    guestroom: str = Field("no", pattern="^(yes|no)$", description="Guest room availability")
    basement: str = Field("no", pattern="^(yes|no)$", description="Basement availability")
    hotwaterheating: str = Field("no", pattern="^(yes|no)$", description="Hot water heating system")
    airconditioning: str = Field("yes", pattern="^(yes|no)$", description="Central air conditioning")
    prefarea: str = Field("yes", pattern="^(yes|no)$", description="Located in prime preferred area")
    furnishingstatus: str = Field("furnished", pattern="^(furnished|semi-furnished|unfurnished)$", description="Furnishing tier")


@app.post("/api/predict")
def predict_valuation(req: ValuationRequest):
    try:
        result = engine.predict(req.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation inference error: {str(e)}")


@app.get("/api/sensitivity")
def get_sensitivity(
    feature: str = Query("area", description="Feature to vary"),
    area: float = Query(6500),
    bedrooms: int = Query(4),
    bathrooms: int = Query(2),
    stories: int = Query(2),
    parking: int = Query(2),
    mainroad: str = Query("yes"),
    guestroom: str = Query("no"),
    basement: str = Query("no"),
    hotwaterheating: str = Query("no"),
    airconditioning: str = Query("yes"),
    prefarea: str = Query("yes"),
    furnishingstatus: str = Query("furnished"),
):
    payload = {
        "area": area, "bedrooms": bedrooms, "bathrooms": bathrooms, "stories": stories,
        "parking": parking, "mainroad": mainroad, "guestroom": guestroom, "basement": basement,
        "hotwaterheating": hotwaterheating, "airconditioning": airconditioning,
        "prefarea": prefarea, "furnishingstatus": furnishingstatus
    }
    return engine.sensitivity(payload, feature)


# Market Intelligence Analytics Endpoints
@app.get("/api/analytics")
def get_analytics():
    try:
        return engine.get_market_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")
