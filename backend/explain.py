"""Exact interventional Shapley values for a fitted tabular pipeline.

Method
------
For an input x and a background sample B (drawn from the training split), the value of a
coalition S of raw features is

    v(S) = mean_{b in B} f(x_S, b_{not S})

i.e. features in S are fixed to x and the remaining features are taken from each background
row ("interventional" / marginal expectation). With M = 12 raw features we enumerate all
2^M = 4096 coalitions exactly (no sampling) and compute

    phi_i = sum_{S not containing i} |S|! (M-|S|-1)! / M! * (v(S u {i}) - v(S)).

These are exact Shapley values of the game v. By the efficiency property,

    sum_i phi_i = v(all) - v(empty) = f(x) - mean_{b in B} f(b),

which is verified numerically for every explanation (`additivity_error`).

Contributions describe how the *model* moves its prediction away from the background average.
They are not causal effects of the features on real-world prices.
"""
from __future__ import annotations

from math import factorial

import numpy as np
import pandas as pd


class ShapleyExplainer:
    def __init__(self, predict_fn, background: pd.DataFrame, feature_order: list[str]):
        self.predict_fn = predict_fn
        self.features = list(feature_order)
        self.background = background[self.features].reset_index(drop=True)
        self.m = len(self.features)
        n_coalitions = 1 << self.m
        codes = np.arange(n_coalitions, dtype=np.int64)
        self.masks = ((codes[:, None] >> np.arange(self.m)) & 1).astype(bool)  # (2^M, M)
        sizes = self.masks.sum(axis=1)
        self.weights = np.array(
            [factorial(s) * factorial(self.m - s - 1) / factorial(self.m) if s < self.m else 0.0 for s in sizes]
        )
        self.codes = codes
        self.sizes = sizes
        self.baseline = float(np.mean(self.predict_fn(self.background)))

    def explain(self, x: pd.DataFrame) -> dict:
        x_row = x[self.features].iloc[0]
        n_bg = len(self.background)
        n_coalitions = len(self.codes)
        data = {}
        for j, feat in enumerate(self.features):
            bg_col = self.background[feat].to_numpy()
            fixed = np.full(n_bg, x_row[feat], dtype=bg_col.dtype if bg_col.dtype != object else object)
            col = np.where(self.masks[:, j][:, None], fixed[None, :], bg_col[None, :])
            data[feat] = col.reshape(-1)
        frame = pd.DataFrame(data, columns=self.features)
        preds = np.asarray(self.predict_fn(frame), dtype=float).reshape(n_coalitions, n_bg)
        v = preds.mean(axis=1)

        phi = np.zeros(self.m)
        for i in range(self.m):
            bit = 1 << i
            without = self.codes[(self.codes & bit) == 0]
            phi[i] = np.sum(self.weights[without] * (v[without | bit] - v[without]))

        full_value = float(v[-1])
        empty_value = float(v[0])
        return {
            "baseline": empty_value,
            "prediction": full_value,
            "contributions": {f: float(p) for f, p in zip(self.features, phi)},
            "additivity_error": float(abs(empty_value + phi.sum() - full_value)),
            "background_size": n_bg,
            "coalitions_evaluated": n_coalitions,
        }
