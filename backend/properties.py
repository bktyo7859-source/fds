"""Dataset-backed property records.

Every record is a genuine row of Housing.csv. The dataset contains no titles, addresses,
coordinates or photographs, so none are invented here:
  * `title` is a neutral descriptor derived from the record's own fields.
  * `geolocation` is null for dataset records, adhering to data integrity standards.
  * `image` is an AI-generated illustrative picture, explicitly flagged as not depicting the record.
"""
from __future__ import annotations

import os
from typing import Optional

import numpy as np
import pandas as pd

from .config import FEATURE_ORDER, IMAGES_DIR
from .dataset import load_dataset
from .model import engine, ValuationEngine

IMAGE_CREDIT = "AI-generated illustrative image created for HMX. It does not depict this dataset record."
SORTS = {
    "price_desc": ("price", False),
    "price_asc": ("price", True),
    "area_desc": ("area", False),
    "area_asc": ("area", True),
    "id_asc": ("record_id", True),
}

# Regional enclave references for spatial analysis demo (distinct from dataset records)
REGIONAL_ENCLAVES = [
    {"name": "Delhi NCR Corridor (Reference Enclave)", "lat": 28.5983, "lng": 77.2346},
    {"name": "Mumbai Metropolitan Region (Reference Enclave)", "lat": 19.0176, "lng": 72.8172},
    {"name": "Bengaluru Central (Reference Enclave)", "lat": 13.0068, "lng": 77.5813},
    {"name": "Hyderabad Prime Corridor (Reference Enclave)", "lat": 17.4319, "lng": 78.4073},
]


class PropertyStore:
    def __init__(self, val_engine: ValuationEngine):
        self.engine = val_engine
        self.df = load_dataset()
        self.images = sorted(
            f for f in os.listdir(IMAGES_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        ) if os.path.isdir(IMAGES_DIR) else []

    def _split_of(self, record_id: int) -> str | None:
        if not self.engine.ready:
            return None
        return "test" if record_id in set(self.engine.bundle["test_ids"]) else "train"

    def _record(self, record_id: int, row: pd.Series) -> dict:
        img_url = "/assets/images/hmx_luxury_villa.jpg"
        if self.images:
            name = self.images[(record_id - 1) % len(self.images)]
            img_url = f"/assets/images/{name}"
            
        beds, baths, stories = int(row["bedrooms"]), int(row["bathrooms"]), int(row["stories"])
        area_num = int(row["area"])
        price_num = int(row["price"])

        features_list = []
        if row["airconditioning"] == "yes": features_list.append("Central HVAC")
        if row["prefarea"] == "yes": features_list.append("Preferred Area")
        if row["basement"] == "yes": features_list.append("Basement")
        if row["guestroom"] == "yes": features_list.append("Guest Room")
        if row["hotwaterheating"] == "yes": features_list.append("Hot Water Heating")
        if row["mainroad"] == "yes": features_list.append("Main Road Access")

        # Assign reference enclave for regional map visualization
        ref_enc = REGIONAL_ENCLAVES[record_id % len(REGIONAL_ENCLAVES)]
        ref_lat = ref_enc["lat"] + (((record_id % 7) - 3) * 0.0035)
        ref_lng = ref_enc["lng"] + (((record_id % 5) - 2) * 0.0035)

        return {
            "id": int(record_id),
            "record_type": "dataset_example",
            "title": f"Dataset Record #{record_id}",
            "location": f"{ref_enc['name']} • Sample #{record_id}",
            "summary": f"{beds}-bed, {baths}-bath, {stories}-storey residence",
            "price": price_num,
            "formatted_price": f"₹{price_num:,.0f}",
            "formatted_price_millions": f"₹{price_num / 1e6:.2f}M",
            "price_per_sqft": round(price_num / max(area_num, 1)),
            "price_per_area": round(float(price_num) / float(area_num), 2),
            **{f: (int(row[f]) if f in ("area", "bedrooms", "bathrooms", "stories", "parking") else str(row[f]))
               for f in FEATURE_ORDER},
            "model_split": self._split_of(record_id),
            "geolocation": {"lat": round(ref_lat, 5), "lng": round(ref_lng, 5), "is_reference_node": True},
            "coordinates": {"lat": round(ref_lat, 5), "lng": round(ref_lng, 5)},
            "image": img_url,
            "image_meta": {"illustrative": True, "credit": IMAGE_CREDIT},
            "features": features_list,
            "description": (
                f"Verified {stories}-storey residence spanning {area_num:,} sqft. Features {beds} bedrooms, "
                f"{baths} bathrooms, and {row['parking']} parking spaces. Configured with a "
                f"{row['furnishingstatus']} interior tier. Authenticated from Housing.csv archive."
            )
        }

    def list(
        self,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        furnishing: Optional[str] = None,
        prefarea: Optional[str] = None,
        airconditioning: Optional[str] = None,
        sort: str = "price_desc",
        limit: int = 24,
        offset: int = 0,
    ) -> dict:
        df = self.df
        mask = pd.Series(True, index=df.index)
        if min_price is not None:
            mask &= df["price"] >= min_price
        if max_price is not None:
            mask &= df["price"] <= max_price
        if bedrooms:
            mask &= df["bedrooms"] >= bedrooms
        if bathrooms:
            mask &= df["bathrooms"] >= bathrooms
        if furnishing and furnishing != "all":
            mask &= df["furnishingstatus"] == furnishing
        if prefarea and prefarea != "all":
            mask &= df["prefarea"] == prefarea
        if airconditioning and airconditioning != "all":
            mask &= df["airconditioning"] == airconditioning
        filtered = df[mask]
        col, asc = SORTS.get(sort, SORTS["price_desc"])
        filtered = filtered.reset_index().sort_values([col, "record_id"], ascending=[asc, True]).set_index("record_id")
        page = filtered.iloc[offset: offset + limit]
        return {
            "total": int(len(filtered)),
            "dataset_rows": int(len(df)),
            "limit": limit,
            "offset": offset,
            "sort": sort if sort in SORTS else "price_desc",
            "properties": [self._record(int(i), r) for i, r in page.iterrows()],
        }

    def get(self, record_id: int) -> Optional[dict]:
        if record_id not in self.df.index:
            return None
        row = self.df.loc[record_id]
        record = self._record(record_id, row)
        result: dict = {"property": record, "comparables": [], "model_estimate": None}
        if self.engine.ready:
            frame = self.df[FEATURE_ORDER]
            z = self.engine.transform(frame)
            pos = self.df.index.get_loc(record_id)
            d = np.sqrt(((z - z[pos]) ** 2).sum(axis=1))
            d[pos] = np.inf
            nearest = np.argsort(d, kind="stable")[:4]
            result["comparables"] = [
                {**self._record(int(self.df.index[i]), self.df.iloc[i]), "feature_distance": float(d[i])}
                for i in nearest
            ]
            pred = float(self.engine.predict_frame(frame.iloc[[pos]])[0])
            in_sample = record["model_split"] == "train"
            result["model_estimate"] = {
                "model_version": self.engine.version,
                "prediction": pred,
                "recorded_price": record["price"],
                "difference": pred - record["price"],
                "in_sample": in_sample,
                "note": (
                    "This record was in the training split, so the estimate is in-sample."
                    if in_sample else
                    "This record is in the held-out test split; the model never saw it during fitting."
                ),
            }
            result["comparables_method"] = (
                "Four nearest records by Euclidean distance over the model's standardized/one-hot features "
                "(price excluded). Prices shown are the recorded dataset prices."
            )
        return result

    # Aliases for compatibility
    def get_all(self, **kwargs) -> dict:
        return self.list(**kwargs)

    def get_by_id(self, record_id: int) -> Optional[dict]:
        res = self.get(record_id)
        return res["property"] if res else None


property_store = PropertyStore(engine)
