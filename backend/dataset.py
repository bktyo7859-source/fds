"""Dataset loading and schema validation for Housing.csv."""
from __future__ import annotations

import pandas as pd

from .config import CATEGORY_LEVELS, DATASET_PATH, FEATURE_ORDER, NUMERIC_FEATURES, TARGET


class DatasetValidationError(RuntimeError):
    pass


def load_dataset(path: str = DATASET_PATH) -> pd.DataFrame:
    """Load Housing.csv and validate columns, types, missing values and category levels.

    The returned frame has a stable `record_id` (1-based row number in the CSV) as its index.
    """
    df = pd.read_csv(path)
    expected = [TARGET] + FEATURE_ORDER
    missing = [c for c in expected if c not in df.columns]
    extra = [c for c in df.columns if c not in expected]
    if missing:
        raise DatasetValidationError(f"Housing.csv is missing columns: {missing}")
    if extra:
        raise DatasetValidationError(f"Housing.csv has unexpected columns: {extra}")
    if df[expected].isnull().any().any():
        nulls = df[expected].isnull().sum()
        raise DatasetValidationError(f"Housing.csv has missing values: {nulls[nulls > 0].to_dict()}")

    for col in [TARGET] + NUMERIC_FEATURES:
        if not pd.api.types.is_integer_dtype(df[col]) and not pd.api.types.is_float_dtype(df[col]):
            raise DatasetValidationError(f"Column {col!r} must be numeric, got {df[col].dtype}")
        if (df[col] < 0).any():
            raise DatasetValidationError(f"Column {col!r} contains negative values")

    for col, levels in CATEGORY_LEVELS.items():
        values = df[col].astype(str).str.strip().str.lower()
        unknown = sorted(set(values) - set(levels))
        if unknown:
            raise DatasetValidationError(f"Column {col!r} has unexpected levels {unknown}; expected {levels}")
        df[col] = values

    df = df[expected].copy()
    df.index = pd.RangeIndex(start=1, stop=len(df) + 1, name="record_id")
    return df
