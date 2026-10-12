"""
HMX Properties Database
Loads and enriches all 545 authentic records from Housing.csv with architectural metadata,
enclave coordinates, imagery, and specifications.
"""

import os
import pandas as pd
from typing import List, Dict, Any, Optional

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Housing.csv")

ARCHITECTURAL_TITLES = [
    "The Travertine Pavilion",
    "Villa Serena & Sunset Terrace",
    "The Glasshouse Residence",
    "The Obsidian Sanctuary",
    "Casa Terrena Minimalist Estate",
    "The Lumina Penthouse",
    "The Arches Heritage Manor",
    "Solarium Ridge Villa",
    "The Horizon Infinity Estate",
    "Belvedere Courtyard House",
    "The Monolith Villa",
    "Verdant Grove Sanctuary",
    "Atelier Residence No. 7",
    "The Zen Promenade Estate",
    "Crestview Modernist Villa"
]

LOCATIONS = [
    {"name": "Golf Links Enclave, New Delhi", "lat": 28.5983, "lng": 77.2346},
    {"name": "Worli Sea Face, Mumbai", "lat": 19.0176, "lng": 72.8172},
    {"name": "Sadashivnagar, Bengaluru", "lat": 13.0068, "lng": 77.5813},
    {"name": "Jubilee Hills, Hyderabad", "lat": 17.4319, "lng": 78.4073},
    {"name": "Malabar Hill, Mumbai", "lat": 18.9548, "lng": 72.7985},
    {"name": "Panchsheel Park, New Delhi", "lat": 28.5457, "lng": 77.2177},
    {"name": "Koregaon Park, Pune", "lat": 18.5362, "lng": 73.8940},
    {"name": "Boat Club Road, Chennai", "lat": 13.0238, "lng": 80.2452},
    {"name": "Alibaug Coastal Belt", "lat": 18.6414, "lng": 72.8722},
    {"name": "Banjara Hills, Hyderabad", "lat": 17.4156, "lng": 78.4350}
]

IMAGE_GALLERY = [
    "/assets/images/hmx_luxury_villa.jpg",
    "/assets/images/hmx_glass_pavilion.jpg",
    "/assets/images/hmx_penthouse.jpg",
    "/assets/images/hmx_courtyard_estate.jpg",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80"
]

class PropertyStore:
    def __init__(self):
        self.properties: List[Dict[str, Any]] = []
        self._load_and_enrich()

    def _load_and_enrich(self):
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(f"Housing.csv not found at {CSV_PATH}")

        df = pd.read_csv(CSV_PATH)
        for idx, row in df.iterrows():
            prop_id = int(idx + 1)
            title = ARCHITECTURAL_TITLES[idx % len(ARCHITECTURAL_TITLES)]
            loc = LOCATIONS[idx % len(LOCATIONS)]
            # Add subtle jitter to coordinates for distinct map pins
            lat = loc["lat"] + ((idx % 7) - 3) * 0.003
            lng = loc["lng"] + ((idx % 5) - 2) * 0.003
            img = IMAGE_GALLERY[idx % len(IMAGE_GALLERY)]

            price_num = int(row['price'])
            area_num = int(row['area'])

            features_list = []
            if row['airconditioning'] == 'yes':
                features_list.append("Central HVAC")
            if row['prefarea'] == 'yes':
                features_list.append("Prime Enclave")
            if row['basement'] == 'yes':
                features_list.append("Subterranean Level")
            if row['guestroom'] == 'yes':
                features_list.append("Private Guest Suite")
            if row['hotwaterheating'] == 'yes':
                features_list.append("Thermal Hydronic Heating")
            if row['mainroad'] == 'yes':
                features_list.append("Main Boulevard Access")

            desc = (
                f"Exceptional {row['stories']}-storey architectural residence spanning {area_num:,} sqft. "
                f"Features {row['bedrooms']} en-suite bedrooms, {row['bathrooms']} designer bathrooms, and "
                f"dedicated parking for {row['parking']} vehicles. Configured with a refined "
                f"{row['furnishingstatus']} interior aesthetic and premium residential amenities."
            )

            self.properties.append({
                "id": prop_id,
                "title": f"{title} #{prop_id}",
                "location": loc["name"],
                "coordinates": {"lat": round(lat, 5), "lng": round(lng, 5)},
                "price": price_num,
                "formatted_price": f"₹{price_num:,.0f}",
                "formatted_price_millions": f"₹{price_num / 1e6:.2f}M",
                "price_per_sqft": round(price_num / max(area_num, 1)),
                "area": area_num,
                "bedrooms": int(row['bedrooms']),
                "bathrooms": int(row['bathrooms']),
                "stories": int(row['stories']),
                "parking": int(row['parking']),
                "mainroad": str(row['mainroad']),
                "guestroom": str(row['guestroom']),
                "basement": str(row['basement']),
                "hotwaterheating": str(row['hotwaterheating']),
                "airconditioning": str(row['airconditioning']),
                "prefarea": str(row['prefarea']),
                "furnishingstatus": str(row['furnishingstatus']),
                "image": img,
                "features": features_list,
                "description": desc
            })

    def get_all(
        self,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        furnishing: Optional[str] = None,
        prefarea: Optional[str] = None,
        limit: int = 24,
        offset: int = 0
    ) -> Dict[str, Any]:
        filtered = self.properties

        if min_price is not None:
            filtered = [p for p in filtered if p["price"] >= min_price]
        if max_price is not None:
            filtered = [p for p in filtered if p["price"] <= max_price]
        if bedrooms is not None and bedrooms > 0:
            filtered = [p for p in filtered if p["bedrooms"] >= bedrooms]
        if bathrooms is not None and bathrooms > 0:
            filtered = [p for p in filtered if p["bathrooms"] >= bathrooms]
        if furnishing and furnishing != "all":
            filtered = [p for p in filtered if p["furnishingstatus"].lower() == furnishing.lower()]
        if prefarea and prefarea != "all":
            filtered = [p for p in filtered if p["prefarea"].lower() == prefarea.lower()]

        total_count = len(filtered)
        paginated = filtered[offset: offset + limit]

        return {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "properties": paginated
        }

    def get_by_id(self, prop_id: int) -> Optional[Dict[str, Any]]:
        for p in self.properties:
            if p["id"] == prop_id:
                return p
        return None

property_store = PropertyStore()
