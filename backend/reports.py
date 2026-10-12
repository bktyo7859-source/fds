"""
HMX Canonical Valuation Report & Verification Hash Module.

Provides deterministic SHA-256 calculation over canonical JSON representation of
report inputs, model version, and prediction result.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any

def compute_report_hash(inputs: Dict[str, Any], model_version: str, prediction: float) -> Dict[str, Any]:
    """
    Computes a deterministic tamper-evidence hash from the canonical representation
    of property inputs, model version, and prediction value.
    """
    canonical_payload = {
        "inputs": {k: inputs[k] for k in sorted(inputs.keys())},
        "model_version": str(model_version),
        "prediction_raw": round(float(prediction), 4)
    }
    canonical_json = json.dumps(canonical_payload, sort_keys=True, separators=(',', ':'))
    digest = hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()
    
    return {
        "verification_hash": f"HMX-{digest[:16].upper()}",
        "full_sha256": digest,
        "canonical_payload": canonical_payload,
        "hash_description": (
            "Deterministic SHA-256 digest computed over the sorted canonical JSON representation "
            "of input specifications, model version, and predicted value. This verification code provides "
            "tamper-evidence for the numerical contents of this digital dossier. It does NOT constitute legal title, "
            "municipal survey certification, or deed registration."
        )
    }
