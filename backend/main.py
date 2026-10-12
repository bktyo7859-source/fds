"""
HMX Real Estate Intelligence Platform — FastAPI Backend
Provides live ML inference, real dataset property exploration, analytics,
and high-performance video streaming with HTTP Range support.
"""

import os
import re
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .model import engine
from .properties import property_store

app = FastAPI(
    title="HMX Real Estate Intelligence API",
    description="Enterprise machine learning valuation engine and property analytics platform",
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

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO_VIDEO_PATH = os.path.join(PROJECT_ROOT, "landing page.mp4")
SCROLL_DIR = os.path.join(PROJECT_ROOT, "scroll down")
SCROLL_VIDEO_NAME = os.listdir(SCROLL_DIR)[0] if os.path.exists(SCROLL_DIR) and len(os.listdir(SCROLL_DIR)) > 0 else ""
SCROLL_VIDEO_PATH = os.path.join(SCROLL_DIR, SCROLL_VIDEO_NAME) if SCROLL_VIDEO_NAME else ""

# Ensure assets/images directory exists and is mounted
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets", "images")
os.makedirs(ASSETS_DIR, exist_ok=True)
app.mount("/assets/images", StaticFiles(directory=ASSETS_DIR), name="assets")


def range_requests_response(
    request: Request, file_path: str, content_type: str = "video/mp4"
):
    """Serve media files supporting HTTP 206 Partial Content (Range requests) for smooth scrubbing."""
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
        "dataset_rows": len(property_store.properties),
        "ml_model_loaded": engine.pipeline is not None,
        "hero_video_exists": os.path.exists(HERO_VIDEO_PATH),
        "scroll_video_exists": os.path.exists(SCROLL_VIDEO_PATH),
        "metrics": engine.metrics
    }


# Video streaming endpoints
@app.get("/videos/hero")
def stream_hero_video(request: Request):
    """Stream preserved landing page hero video with full Range seeking support."""
    return range_requests_response(request, HERO_VIDEO_PATH)


@app.get("/videos/scroll")
def stream_scroll_video(request: Request):
    """Stream preserved scroll-down drone house tour video with full Range seeking support."""
    return range_requests_response(request, SCROLL_VIDEO_PATH)


# Property Exploration Endpoints
@app.get("/api/properties")
def get_properties(
    min_price: Optional[int] = Query(None, description="Minimum price in INR"),
    max_price: Optional[int] = Query(None, description="Maximum price in INR"),
    bedrooms: Optional[int] = Query(None, description="Minimum bedrooms"),
    bathrooms: Optional[int] = Query(None, description="Minimum bathrooms"),
    furnishing: Optional[str] = Query("all", description="Furnishing status filter"),
    prefarea: Optional[str] = Query("all", description="Preferred area filter"),
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    return property_store.get_all(
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        furnishing=furnishing,
        prefarea=prefarea,
        limit=limit,
        offset=offset
    )


@app.get("/api/properties/{property_id}")
def get_property_detail(property_id: int):
    prop = property_store.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Also find 3 comparable properties with similar area/price
    all_props = property_store.properties
    comparables = sorted(
        [p for p in all_props if p["id"] != property_id],
        key=lambda x: abs(x["area"] - prop["area"]) + abs(x["price"] - prop["price"]) / 1000
    )[:3]

    return {
        "property": prop,
        "comparables": comparables
    }


# Machine Learning Prediction Endpoints
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
    prefarea: str = Field("yes", pattern="^(yes|no)$", description="Located in prime preferred enclave")
    furnishingstatus: str = Field("furnished", pattern="^(furnished|semi-furnished|unfurnished)$", description="Furnishing tier")


@app.post("/api/predict")
def predict_valuation(req: ValuationRequest):
    try:
        result = engine.predict(req.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation inference error: {str(e)}")


# Market Intelligence Analytics Endpoints
@app.get("/api/analytics")
def get_analytics():
    try:
        return engine.get_market_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")
