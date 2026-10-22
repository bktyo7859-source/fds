"""Central configuration: paths, the model feature schema, and the dataset unit convention."""
from __future__ import annotations

import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

DATASET_PATH = (
    os.path.join(BACKEND_DIR, "Housing.csv")
    if os.path.exists(os.path.join(BACKEND_DIR, "Housing.csv"))
    else os.path.join(PROJECT_ROOT, "Housing.csv")
)
ARTIFACT_DIR = os.path.join(BACKEND_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACT_DIR, "model.joblib")
MODEL_CARD_PATH = os.path.join(ARTIFACT_DIR, "model_card.json")
MEDIA_FINGERPRINTS_PATH = os.path.join(BACKEND_DIR, "media_fingerprints.json")
IMAGES_DIR = (
    os.path.join(BACKEND_DIR, "assets", "images")
    if os.path.exists(os.path.join(BACKEND_DIR, "assets", "images"))
    else os.path.join(PROJECT_ROOT, "assets", "images")
)

# Original media — referenced in place, never modified.
HERO_VIDEO_PATH = os.path.join(PROJECT_ROOT, "landing page.mp4")
CINEMATIC_HERO_PATH = os.path.join(
    PROJECT_ROOT,
    "Shanghai, China's MEGA City _ Breathtaking 8K Night Video by DJI Inspire 3 - (1080p).mp4",
)
SCROLL_VIDEO_PATH = os.path.join(
    PROJECT_ROOT,
    "scroll down",
    "Real Estate - FPV Drone Virtual House Tour - Frimm Immobiliare Sardegna - salva.tours (1080p, h264).mp4",
)

# ---------------------------------------------------------------------------
# Feature schema — must match Housing.csv column names exactly.
# ---------------------------------------------------------------------------
TARGET = "price"
NUMERIC_FEATURES = ["area", "bedrooms", "bathrooms", "stories", "parking"]
BINARY_FEATURES = ["mainroad", "guestroom", "basement", "hotwaterheating", "airconditioning", "prefarea"]
CATEGORICAL_FEATURES = BINARY_FEATURES + ["furnishingstatus"]
FEATURE_ORDER = [
    "area", "bedrooms", "bathrooms", "stories", "mainroad", "guestroom", "basement",
    "hotwaterheating", "airconditioning", "parking", "prefarea", "furnishingstatus",
]
CATEGORY_LEVELS = {
    **{f: ["no", "yes"] for f in BINARY_FEATURES},
    "furnishingstatus": ["furnished", "semi-furnished", "unfurnished"],
}
FEATURE_LABELS = {
    "area": "Area",
    "bedrooms": "Bedrooms",
    "bathrooms": "Bathrooms",
    "stories": "Stories",
    "parking": "Parking spaces",
    "mainroad": "Main-road access",
    "guestroom": "Guest room",
    "basement": "Basement",
    "hotwaterheating": "Hot-water heating",
    "airconditioning": "Air conditioning",
    "prefarea": "Preferred area",
    "furnishingstatus": "Furnishing status",
}

# ---------------------------------------------------------------------------
# Model hyper-parameters (fixed in advance; NOT tuned on the test set).
# ---------------------------------------------------------------------------
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5
GBR_PARAMS = dict(n_estimators=120, learning_rate=0.08, max_depth=3, random_state=RANDOM_STATE)
INTERVAL_LEVELS = [0.80, 0.90]
SHAP_BACKGROUND_SIZE = 64

# ---------------------------------------------------------------------------
# Unit convention. The Kaggle dataset card for Housing.csv does not document
# the currency of `price` or the unit of `area`. Community notebooks commonly
# treat price as INR and area as square feet, but that is unverified.
# HMX therefore displays prices in raw dataset units, never converts them,
# and labels the area unit as an assumption.
# ---------------------------------------------------------------------------
UNITS = {
    "price": {
        "label": "dataset price units",
        "short": "PU",
        "documented": False,
        "note": (
            "The dataset documentation does not state a currency. Values are shown exactly as recorded "
            "in Housing.csv, without conversion. Community analyses often treat them as Indian rupees, "
            "but HMX does not assume this."
        ),
    },
    "area": {
        "label": "sq ft (assumed)",
        "short": "sq ft*",
        "documented": False,
        "note": "The dataset documentation does not state the area unit; square feet is a common but unverified interpretation.",
    },
}

DATASET_PROVENANCE = {
    "name": "Housing Prices Dataset (Housing.csv)",
    "commonly_distributed_via": "Kaggle (uploaded by M Yasser H)",
    "rows_expected": 545,
    "geography": "Not recorded in the data. No addresses, coordinates, or dates are present.",
    "photographs": "None. The dataset is purely tabular.",
}
