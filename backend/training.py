"""Reproducible training + honest evaluation for the HMX valuation model.

Run:  python -m backend.training

Protocol (fixed in advance, no tuning on the test split):
  1. Validate Housing.csv.
  2. Split 80/20 with random_state=42. The 20% test split is used ONLY for final reporting
     (metrics, interval coverage, permutation importance, error distribution).
  3. 5-fold shuffled CV on the training split -> CV metrics and out-of-fold residuals.
  4. Prediction intervals = split/cross conformal style: the finite-sample-adjusted quantile of
     absolute out-of-fold residuals on the TRAINING split. Coverage is then measured on test.
  5. Fit the pipeline on the full training split. That fitted pipeline is the deployed model,
     so the reported test metrics describe exactly the model the API serves.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import platform
import time
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .config import (
    ARTIFACT_DIR, CATEGORICAL_FEATURES, CATEGORY_LEVELS, CV_FOLDS, DATASET_PATH, DATASET_PROVENANCE,
    FEATURE_LABELS, FEATURE_ORDER, GBR_PARAMS, INTERVAL_LEVELS, MODEL_CARD_PATH, MODEL_PATH,
    NUMERIC_FEATURES, RANDOM_STATE, SHAP_BACKGROUND_SIZE, TARGET, TEST_SIZE, UNITS,
)
from .dataset import load_dataset
from .explain import ShapleyExplainer

ARTIFACT_FORMAT_VERSION = 2


def build_pipeline() -> Pipeline:
    preprocess = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(
                    categories=[CATEGORY_LEVELS[c] for c in CATEGORICAL_FEATURES],
                    handle_unknown="ignore",
                ),
                CATEGORICAL_FEATURES,
            ),
        ],
        sparse_threshold=0.0,
    )
    return Pipeline([("preprocess", preprocess), ("model", GradientBoostingRegressor(**GBR_PARAMS))])


def conformal_quantile(abs_residuals: np.ndarray, level: float) -> float:
    n = len(abs_residuals)
    k = min(math.ceil((n + 1) * level), n)
    return float(np.sort(abs_residuals)[k - 1])


def metric_block(y_true, y_pred) -> dict:
    return {
        "r2": float(r2_score(y_true, y_pred)),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "n": int(len(y_true)),
    }


def nearest_neighbor_distances(z: np.ndarray) -> np.ndarray:
    d2 = ((z[:, None, :] - z[None, :, :]) ** 2).sum(axis=2)
    np.fill_diagonal(d2, np.inf)
    return np.sqrt(d2.min(axis=1))


def histogram(values: np.ndarray, bins: int) -> list[dict]:
    counts, edges = np.histogram(values, bins=bins)
    return [
        {"start": float(edges[i]), "end": float(edges[i + 1]), "count": int(counts[i])}
        for i in range(len(counts))
    ]


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def train(verbose: bool = True) -> dict:
    t0 = time.time()
    df = load_dataset(DATASET_PATH)
    X = df[FEATURE_ORDER]
    y = df[TARGET].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE)

    # --- Cross-validation on the training split only -------------------------------------
    kf = KFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)
    cv = cross_validate(
        build_pipeline(), X_train, y_train, cv=kf,
        scoring=("r2", "neg_mean_absolute_error", "neg_root_mean_squared_error"),
    )
    oof_pred = cross_val_predict(build_pipeline(), X_train, y_train, cv=kf)
    oof_abs = np.abs(y_train.to_numpy() - oof_pred)
    quantiles = {f"{lvl:.2f}": conformal_quantile(oof_abs, lvl) for lvl in INTERVAL_LEVELS}

    # --- Fit deployed model on the full training split -----------------------------------
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    pred_train = pipeline.predict(X_train)
    pred_test = pipeline.predict(X_test)
    test_resid = y_test.to_numpy() - pred_test
    test_abs = np.abs(test_resid)

    # Empirical coverage on held-out test data (never used for calibration).
    coverage = {}
    terciles = np.quantile(pred_test, [1 / 3, 2 / 3])
    bands = np.digitize(pred_test, terciles)
    for key, q in quantiles.items():
        inside = test_abs <= q
        coverage[key] = {
            "nominal": float(key),
            "half_width": q,
            "empirical_test_coverage": float(inside.mean()),
            "by_predicted_price_tercile": [
                {"tercile": int(b + 1), "n": int((bands == b).sum()), "coverage": float(inside[bands == b].mean())}
                for b in range(3)
            ],
        }

    # --- Importances ----------------------------------------------------------------------
    pre = pipeline.named_steps["preprocess"]
    encoded_names = list(pre.get_feature_names_out())
    raw_of = []
    for name in encoded_names:
        block, rest = name.split("__", 1)
        if block == "num":
            raw_of.append(rest)
        else:
            raw_of.append(next(c for c in CATEGORICAL_FEATURES if rest.startswith(c + "_")))
    imp = pipeline.named_steps["model"].feature_importances_
    impurity = {f: 0.0 for f in FEATURE_ORDER}
    for raw, value in zip(raw_of, imp):
        impurity[raw] += float(value)

    perm = permutation_importance(
        pipeline, X_test, y_test, n_repeats=20, random_state=RANDOM_STATE, scoring="r2"
    )
    permutation = {
        f: {"mean_r2_drop": float(m), "std": float(s)}
        for f, m, s in zip(FEATURE_ORDER, perm.importances_mean, perm.importances_std)
    }

    # --- Out-of-distribution reference ---------------------------------------------------
    numeric_ranges = {
        f: {
            "min": float(X_train[f].min()), "max": float(X_train[f].max()),
            "p01": float(X_train[f].quantile(0.01)), "p99": float(X_train[f].quantile(0.99)),
        }
        for f in NUMERIC_FEATURES
    }
    z_train = pre.transform(X_train)
    nn_train = nearest_neighbor_distances(z_train)
    nn_threshold = float(np.quantile(nn_train, 0.99))

    # --- Shapley background + additivity self-test -----------------------------------------
    background = X_train.sample(n=min(SHAP_BACKGROUND_SIZE, len(X_train)), random_state=RANDOM_STATE)
    explainer = ShapleyExplainer(pipeline.predict, background, FEATURE_ORDER)
    probe = explainer.explain(X_test.iloc[[0]])
    if probe["additivity_error"] > 1e-3:
        raise RuntimeError(f"Shapley additivity check failed: {probe['additivity_error']}")

    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    bundle = {
        "format_version": ARTIFACT_FORMAT_VERSION,
        "pipeline": pipeline,
        "feature_order": FEATURE_ORDER,
        "category_levels": CATEGORY_LEVELS,
        "interval_quantiles": quantiles,
        "numeric_ranges": numeric_ranges,
        "z_train": z_train,
        "nn_threshold": nn_threshold,
        "shap_background": background,
        "train_ids": [int(i) for i in X_train.index],
        "test_ids": [int(i) for i in X_test.index],
    }
    joblib.dump(bundle, MODEL_PATH)
    artifact_sha = sha256_file(MODEL_PATH)

    card = {
        "format_version": ARTIFACT_FORMAT_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "artifact_sha256": artifact_sha,
        "environment": {
            "python": platform.python_version(), "scikit_learn": sklearn.__version__,
            "pandas": pd.__version__, "numpy": np.__version__,
        },
        "dataset": {
            **DATASET_PROVENANCE,
            "path": os.path.basename(DATASET_PATH),
            "sha256": sha256_file(DATASET_PATH),
            "rows": int(len(df)),
            "target": TARGET,
            "features": FEATURE_ORDER,
            "feature_labels": FEATURE_LABELS,
            "category_levels": CATEGORY_LEVELS,
            "units": UNITS,
        },
        "model": {
            "estimator": "GradientBoostingRegressor",
            "params": GBR_PARAMS,
            "preprocessing": "StandardScaler(numeric) + OneHotEncoder(handle_unknown='ignore') inside one sklearn Pipeline",
            "deployed_fit": "Fitted on the 80% training split only; the 20% test split was never used for fitting, tuning or calibration.",
        },
        "split": {
            "method": "train_test_split", "test_size": TEST_SIZE, "random_state": RANDOM_STATE,
            "n_train": int(len(X_train)), "n_test": int(len(X_test)),
        },
        "metrics": {
            "train": metric_block(y_train, pred_train),
            "cross_validation": {
                "folds": CV_FOLDS, "shuffle": True, "random_state": RANDOM_STATE, "data": "training split only",
                "r2_mean": float(cv["test_r2"].mean()), "r2_std": float(cv["test_r2"].std()),
                "r2_per_fold": [float(v) for v in cv["test_r2"]],
                "mae_mean": float(-cv["test_neg_mean_absolute_error"].mean()),
                "rmse_mean": float(-cv["test_neg_root_mean_squared_error"].mean()),
            },
            "test": metric_block(y_test, pred_test),
        },
        "intervals": {
            "method": (
                "Cross-conformal style interval: prediction ± q, where q is the ceil((n+1)·level)/n "
                "empirical quantile of absolute 5-fold out-of-fold residuals on the training split "
                f"(n={len(oof_abs)}). Symmetric and constant-width; it does not adapt to price level."
            ),
            "levels": coverage,
            "caveat": (
                "Nominal levels are targets, not guarantees: CV-based conformal intervals have weaker "
                "finite-sample guarantees than split conformal, and the test split is small. Check "
                "the empirical coverage figures, including by price tercile."
            ),
        },
        "importance": {
            "impurity_training": {
                "method": "GradientBoosting impurity importance, one-hot columns summed back to raw features (training data).",
                "values": impurity,
            },
            "permutation_test": {
                "method": "Permutation importance on the held-out test split (mean drop in R², 20 repeats).",
                "values": permutation,
            },
        },
        "ood": {
            "numeric_ranges_training": numeric_ranges,
            "novelty": {
                "method": "Euclidean distance (in the fitted preprocessing space) to the nearest training row.",
                "threshold_p99_training_nn_distance": nn_threshold,
            },
        },
        "explanations": {
            "method": "Exact interventional Shapley values over the 12 raw features (all 4096 coalitions enumerated).",
            "background": f"{len(background)} rows sampled from the training split (random_state={RANDOM_STATE}).",
            "baseline_prediction": explainer.baseline,
            "self_test_additivity_error": probe["additivity_error"],
            "caveat": "Contributions explain the model's output relative to the background average; they are not causal effects.",
        },
        "evaluation_artifacts": {
            "test_residual_histogram": histogram(test_resid, 16),
            "test_predicted_vs_actual": [
                {"record_id": int(i), "actual": float(a), "predicted": float(p)}
                for i, a, p in zip(X_test.index, y_test.to_numpy(), pred_test)
            ],
        },
        "training_seconds": round(time.time() - t0, 2),
    }
    with open(MODEL_CARD_PATH, "w", encoding="utf-8") as fh:
        json.dump(card, fh, indent=2)

    if verbose:
        m = card["metrics"]
        print(f"[HMX] trained in {card['training_seconds']}s  artifact sha256={artifact_sha[:12]}")
        print(f"[HMX] train R2={m['train']['r2']:.4f}  CV R2={m['cross_validation']['r2_mean']:.4f}"
              f"±{m['cross_validation']['r2_std']:.4f}  test R2={m['test']['r2']:.4f}")
        print(f"[HMX] test MAE={m['test']['mae']:,.0f}  test RMSE={m['test']['rmse']:,.0f} (dataset price units)")
        for k, c in coverage.items():
            print(f"[HMX] interval nominal {k}: half-width={c['half_width']:,.0f}  "
                  f"test coverage={c['empirical_test_coverage']:.3f}")
        print(f"[HMX] Shapley self-test additivity error={probe['additivity_error']:.2e}")
    return card


if __name__ == "__main__":
    train()
