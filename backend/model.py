"""Inference engine: loads the trained artifact, verifies it, and serves predictions,
conformal-style intervals, out-of-distribution checks, exact Shapley explanations,
and dataset market analytics.
"""
from __future__ import annotations

import hashlib
import json
import os
import threading

import joblib
import numpy as np
import pandas as pd

from .config import (
    FEATURE_LABELS, FEATURE_ORDER, MODEL_CARD_PATH, MODEL_PATH, NUMERIC_FEATURES, UNITS,
)
from .dataset import load_dataset
from .explain import ShapleyExplainer
from .reports import compute_report_hash


class ModelNotReady(RuntimeError):
    pass


def _sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


class ValuationEngine:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.bundle: dict | None = None
        self.card: dict | None = None
        self.explainer: ShapleyExplainer | None = None
        self.load_error: str | None = None

    # ------------------------------------------------------------------ loading
    def load(self, train_if_missing: bool = True) -> None:
        with self._lock:
            try:
                if not (os.path.exists(MODEL_PATH) and os.path.exists(MODEL_CARD_PATH)):
                    if not train_if_missing:
                        raise ModelNotReady("Model artifacts are missing. Run: python -m backend.training")
                    from .training import train
                    train(verbose=True)
                with open(MODEL_CARD_PATH, "r", encoding="utf-8") as fh:
                    card = json.load(fh)
                actual_sha = _sha256(MODEL_PATH)
                if actual_sha != card.get("artifact_sha256"):
                    raise ModelNotReady(
                        "model.joblib does not match the SHA-256 recorded in model_card.json. "
                        "Retrain with: python -m backend.training"
                    )
                bundle = joblib.load(MODEL_PATH)
                if bundle.get("feature_order") != FEATURE_ORDER:
                    raise ModelNotReady(
                        f"Artifact feature schema {bundle.get('feature_order')} does not match the API schema {FEATURE_ORDER}."
                    )
                self.bundle = bundle
                self.card = card
                self.explainer = ShapleyExplainer(bundle["pipeline"].predict, bundle["shap_background"], FEATURE_ORDER)
                self.load_error = None
            except Exception as exc:
                self.bundle = self.card = self.explainer = None
                self.load_error = str(exc)

    @property
    def ready(self) -> bool:
        return self.bundle is not None

    def require(self) -> None:
        if not self.ready:
            raise ModelNotReady(self.load_error or "Model not loaded")

    @property
    def version(self) -> str:
        self.require()
        return self.card["artifact_sha256"][:12]

    # ------------------------------------------------------------------ helpers
    @staticmethod
    def to_frame(payload: dict | list[dict]) -> pd.DataFrame:
        rows = payload if isinstance(payload, list) else [payload]
        return pd.DataFrame([{f: r[f] for f in FEATURE_ORDER} for r in rows], columns=FEATURE_ORDER)

    def predict_frame(self, frame: pd.DataFrame) -> np.ndarray:
        self.require()
        return np.asarray(self.bundle["pipeline"].predict(frame[FEATURE_ORDER]), dtype=float)

    def transform(self, frame: pd.DataFrame) -> np.ndarray:
        self.require()
        return self.bundle["pipeline"].named_steps["preprocess"].transform(frame[FEATURE_ORDER])

    def intervals(self, prediction: float) -> list[dict]:
        out = []
        levels = self.card["intervals"]["levels"]
        for key, q in self.bundle["interval_quantiles"].items():
            lower = prediction - q
            out.append({
                "nominal_level": float(key),
                "lower": max(lower, 0.0),
                "upper": prediction + q,
                "half_width": q,
                "clipped_at_zero": lower < 0,
                "empirical_test_coverage": levels[key]["empirical_test_coverage"],
            })
        return out

    def ood(self, frame: pd.DataFrame) -> dict:
        row = frame.iloc[0]
        flags = []
        for f in NUMERIC_FEATURES:
            r = self.bundle["numeric_ranges"][f]
            v = float(row[f])
            if v < r["min"] or v > r["max"]:
                flags.append({
                    "feature": f, "label": FEATURE_LABELS[f], "value": v, "kind": "outside_training_range",
                    "message": f"{FEATURE_LABELS[f]} = {v:g} is outside the training range {r['min']:g}–{r['max']:g}; the model is extrapolating.",
                })
            elif v < r["p01"] or v > r["p99"]:
                flags.append({
                    "feature": f, "label": FEATURE_LABELS[f], "value": v, "kind": "sparse_region",
                    "message": f"{FEATURE_LABELS[f]} = {v:g} is within the training range but beyond its 1st–99th percentile ({r['p01']:g}–{r['p99']:g}); few comparable examples exist.",
                })
        z = self.transform(frame)
        dist = float(np.sqrt(((self.bundle["z_train"] - z[0]) ** 2).sum(axis=1)).min())
        threshold = float(self.bundle["nn_threshold"])
        novel = dist > threshold
        if novel:
            flags.append({
                "feature": None, "label": "Feature combination", "value": dist, "kind": "novel_combination",
                "message": "This combination of features is further from every training example than 99% of training rows are from their nearest neighbour.",
            })
        severity = "none"
        if any(fl["kind"] in ("sparse_region",) for fl in flags) or novel:
            severity = "caution"
        if any(fl["kind"] == "outside_training_range" for fl in flags):
            severity = "outside"
        return {
            "in_distribution": severity == "none",
            "severity": severity,
            "flags": flags,
            "novelty_distance": dist,
            "novelty_threshold": threshold,
            "scope_note": (
                "Even in-distribution inputs only resemble the 545 homes in Housing.csv; the model has no "
                "knowledge of location, date, market conditions or property types absent from the dataset."
            ),
        }

    def explain(self, frame: pd.DataFrame) -> dict:
        res = self.explainer.explain(frame)
        row = frame.iloc[0]
        contribs = sorted(
            (
                {"feature": f, "label": FEATURE_LABELS[f], "value": row[f].item() if hasattr(row[f], "item") else row[f],
                 "contribution": c}
                for f, c in res["contributions"].items()
            ),
            key=lambda d: abs(d["contribution"]), reverse=True,
        )
        return {
            "method": self.card["explanations"]["method"],
            "background": self.card["explanations"]["background"],
            "baseline": res["baseline"],
            "explained_prediction": res["prediction"],
            "contributions": contribs,
            "sum_of_contributions": float(sum(c["contribution"] for c in contribs)),
            "additivity_error": res["additivity_error"],
            "caveat": self.card["explanations"]["caveat"],
        }

    # ------------------------------------------------------------------ public API
    def predict(self, payload: dict, explain: bool = True) -> dict:
        self.require()
        frame = self.to_frame(payload)
        prediction = float(self.predict_frame(frame)[0])
        
        # Conformal intervals
        intervals_list = self.intervals(prediction)
        int_90 = next((item for item in intervals_list if item["nominal_level"] == 0.90), intervals_list[-1])
        
        ood_res = self.ood(frame)
        explanation_res = None
        attributions_list = []
        if explain:
            explanation_res = self.explain(frame)
            if abs(explanation_res["explained_prediction"] - prediction) > 1e-6 * max(1.0, abs(prediction)):
                raise RuntimeError("Explanation does not correspond to the served prediction")
            for item in explanation_res["contributions"]:
                attributions_list.append({
                    "factor": item["label"],
                    "value": str(item["value"]),
                    "impact": round(item["contribution"]),
                    "positive": item["contribution"] >= 0
                })

        # Deterministic verification hash
        hash_info = compute_report_hash(payload, self.version, prediction)

        area_val = float(payload.get("area", 1))
        extrapolation_warning = None
        if not ood_res["in_distribution"] and ood_res["flags"]:
            extrapolation_warning = "; ".join(f["message"] for f in ood_res["flags"])

        return {
            # Core scientific results
            "model_version": self.version,
            "prediction": prediction,
            "units": UNITS,
            "intervals": intervals_list,
            "interval_method": self.card["intervals"]["method"],
            "interval_caveat": self.card["intervals"]["caveat"],
            "ood": ood_res,
            "inputs": {f: payload[f] for f in FEATURE_ORDER},
            "location_used_by_model": False,
            "test_metrics": self.card["metrics"]["test"],
            "explanation": explanation_res,
            "verification_hash": hash_info["verification_hash"],
            "verification_details": hash_info,

            # Formatted helper fields for UI compatibility
            "predicted_price": round(prediction),
            "formatted_price": f"₹{prediction:,.0f}",
            "formatted_price_millions": f"₹{prediction / 1e6:.2f}M",
            "price_per_sqft": round(prediction / max(area_val, 1)),
            "confidence_interval_95": {
                "lower": round(int_90["lower"]),
                "upper": round(int_90["upper"]),
                "formatted_range": f"₹{int_90['lower'] / 1e6:.2f}M – ₹{int_90['upper'] / 1e6:.2f}M",
                "nominal_coverage": "90% (Empirical test coverage: " + f"{int_90['empirical_test_coverage']*100:.1f}%)"
            },
            "attributions": attributions_list,
            "is_extrapolation": ood_res["severity"] != "none",
            "warning": extrapolation_warning,
            "property_summary": {
                "area_sqft": int(area_val),
                "configuration": f"{payload['bedrooms']} Beds • {payload['bathrooms']} Baths • {payload['stories']} Stories",
                "parking_spaces": payload['parking'],
                "furnishing": str(payload['furnishingstatus']).capitalize(),
                "premium_amenities": [
                    k.replace('_', ' ').title() for k in [
                        "airconditioning", "prefarea", "basement", "guestroom", "hotwaterheating", "mainroad"
                    ] if payload.get(k) == 'yes'
                ]
            }
        }

    def sensitivity(self, payload: dict, feature: str, points: int = 25) -> dict:
        self.require()
        r = self.bundle["numeric_ranges"][feature]
        if feature == "area":
            grid = np.unique(np.round(np.linspace(r["min"], r["max"], points)).astype(int))
        else:
            grid = np.arange(int(r["min"]), int(r["max"]) + 1)
        rows = [{**payload, feature: int(v)} for v in grid]
        preds = self.predict_frame(self.to_frame(rows))
        return {
            "model_version": self.version,
            "feature": feature,
            "label": FEATURE_LABELS[feature],
            "current_value": payload[feature],
            "range": "training range",
            "curve": [{"value": int(v), "prediction": float(p)} for v, p in zip(grid, preds)],
            "note": "Individual conditional expectation: all other inputs held fixed. Describes model behaviour, not causal effects.",
        }

    def get_market_analytics(self) -> dict:
        self.require()
        df = load_dataset()
        prices = df['price'].values
        areas = df['area'].values

        counts, bin_edges = np.histogram(prices, bins=10)
        price_bins = [
            {
                "range": f"₹{bin_edges[i]/1e6:.1f}M–{bin_edges[i+1]/1e6:.1f}M",
                "min": float(bin_edges[i]),
                "max": float(bin_edges[i+1]),
                "count": int(counts[i])
            }
            for i in range(len(counts))
        ]

        sample_df = df.sample(n=min(60, len(df)), random_state=42).sort_values(by='area')
        scatter_data = [
            {
                "area": int(row['area']),
                "price": int(row['price']),
                "price_m": round(row['price'] / 1e6, 2),
                "bedrooms": int(row['bedrooms']),
                "bathrooms": int(row['bathrooms'])
            }
            for _, row in sample_df.iterrows()
        ]

        bed_counts = df['bedrooms'].value_counts().sort_index().to_dict()
        bedroom_data = [{"bedrooms": f"{k} Beds", "count": int(v)} for k, v in bed_counts.items()]

        furn_counts = df['furnishingstatus'].value_counts().to_dict()
        furnishing_data = [{"status": str(k).capitalize(), "count": int(v)} for k, v in furn_counts.items()]

        # Feature importances formatted from model card
        raw_imp = self.card["importance"]["impurity_training"]["values"]
        perm_imp = self.card["importance"]["permutation_test"]["values"]
        formatted_imp = [
            {
                "feature": f,
                "importance": round(raw_imp[f] * 100, 2),
                "permutation_drop_r2": round(perm_imp[f]["mean_r2_drop"], 4)
            }
            for f in sorted(raw_imp.keys(), key=lambda k: raw_imp[k], reverse=True)
        ]

        cv_info = self.card["metrics"]["cross_validation"]
        test_info = self.card["metrics"]["test"]
        train_info = self.card["metrics"]["train"]

        return {
            "summary": {
                "total_properties": len(df),
                "average_price": round(float(np.mean(prices))),
                "median_price": round(float(np.median(prices))),
                "min_price": round(float(np.min(prices))),
                "max_price": round(float(np.max(prices))),
                "average_area": round(float(np.mean(areas))),
                "average_price_per_sqft": round(float(np.mean(prices / areas))),
                "units": UNITS
            },
            "price_distribution": price_bins,
            "scatter_area_vs_price": scatter_data,
            "bedroom_distribution": bedroom_data,
            "furnishing_distribution": furnishing_data,
            "model_metrics": {
                "total_samples": len(df),
                "train_r2": train_info["r2"],
                "test_r2": test_info["r2"],
                "cv_5fold_r2_mean": cv_info["r2_mean"],
                "cv_5fold_r2_std": cv_info["r2_std"],
                "mae": test_info["mae"],
                "rmse": test_info["rmse"],
                "residual_std_error": self.card["intervals"]["levels"]["0.90"]["half_width"],
                "feature_importances": formatted_imp,
                "training_algorithm": "GradientBoostingRegressor (scikit-learn 1.6+)"
            },
            "evaluation_artifacts": self.card.get("evaluation_artifacts", {})
        }


engine = ValuationEngine()
# Auto-load on import
engine.load()
