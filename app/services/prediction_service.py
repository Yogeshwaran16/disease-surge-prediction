from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd


# ---------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]
ML_DIR = BASE_DIR / "ml"
MODEL_DIR = ML_DIR / "models" / "tier1_v2"
DATA_FILE = ML_DIR / "merged_dataset.csv"
METADATA_FILE = MODEL_DIR / "feature_metadata.json"


# ---------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------

_models: Optional[Dict[str, Any]] = None
_metadata: Optional[Dict[str, Any]] = None
_dataset: Optional[pd.DataFrame] = None


def _load_metadata() -> Dict[str, Any]:
    global _metadata

    if _metadata is None:
        with METADATA_FILE.open("r", encoding="utf-8") as file:
            _metadata = json.load(file)

    return _metadata


def _load_models() -> Dict[str, Any]:
    global _models

    if _models is None:
        _models = {
            "xgboost": joblib.load(
                MODEL_DIR / "xgboost_model.pkl"
            ),
            "lightgbm": joblib.load(
                MODEL_DIR / "lightgbm_model.pkl"
            ),
            "catboost": joblib.load(
                MODEL_DIR / "catboost_model.pkl"
            ),
            "meta": joblib.load(
                MODEL_DIR / "logistic_meta_model.pkl"
            ),
            "scaler": joblib.load(
                MODEL_DIR / "meta_scaler.pkl"
            ),
        }

    return _models


def _load_dataset() -> pd.DataFrame:
    global _dataset

    if _dataset is None:
        _dataset = pd.read_csv(DATA_FILE)

    return _dataset


# ---------------------------------------------------------------------
# Risk / confidence
# ---------------------------------------------------------------------

def _risk_level(probability: float) -> str:
    threshold = float(
        _load_metadata().get("selected_threshold", 0.50)
    )

    if probability >= threshold:
        return "HIGH"

    if probability >= 0.40:
        return "MEDIUM"

    return "LOW"


def _confidence_score(probability: float) -> float:
    """
    Confidence is represented as the distance from the
    decision boundary, scaled to 0-1.

    0.50 probability -> 0 confidence
    0.00 / 1.00 -> 1 confidence
    """
    confidence = abs(probability - 0.50) * 2.0

    return round(
        max(0.0, min(1.0, confidence)),
        4,
    )


# ---------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------

def predict_row(row: pd.Series) -> Dict[str, Any]:
    metadata = _load_metadata()
    models = _load_models()

    features = metadata["features"]

    missing = [
        feature
        for feature in features
        if feature not in row.index
    ]

    if missing:
        raise ValueError(
            f"Missing Tier-1 features: {missing}"
        )

    X = pd.DataFrame(
        [[row[feature] for feature in features]],
        columns=features,
    )

    xgb_probability = models["xgboost"].predict_proba(X)[:, 1]
    lgb_probability = models["lightgbm"].predict_proba(X)[:, 1]
    cat_probability = models["catboost"].predict_proba(X)[:, 1]

    meta_input = pd.DataFrame(
        {
            "xgb": xgb_probability,
            "lgb": lgb_probability,
            "cat": cat_probability,
        }
    )

    meta_scaled = models["scaler"].transform(meta_input.to_numpy())

    probability = float(
        models["meta"].predict_proba(meta_scaled)[0, 1]
    )

    probability = round(
        max(0.0, min(1.0, probability)),
        6,
    )

    return {
        "district": row["district"],
        "disease": row["disease"],
        "year": int(row["year"]),
        "week_number": int(row["week_number"]),
        "outbreak_probability": probability,
        "risk_level": _risk_level(probability),
        "confidence_score": _confidence_score(probability),
        "model_version": metadata.get(
            "model_version",
            "tier1_v2",
        ),
        "forecast_7d": None,
        "forecast_14d": None,
        "forecast_21d": None,
        "prediction_intervals": None,
        "forecast_status": (
            "UNAVAILABLE_TIER2_DATA"
        ),
    }


# ---------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------

def get_latest_prediction(
    district: str,
    disease: str,
) -> Dict[str, Any]:
    """
    Generate the latest Tier-1 prediction for one
    district + disease combination.
    """

    dataset = _load_dataset()

    filtered = dataset[
        (dataset["district"].astype(str).str.lower() == district.lower())
        & (dataset["disease"].astype(str).str.lower() == disease.lower())
    ]

    if filtered.empty:
        raise ValueError(
            f"No data found for district='{district}', "
            f"disease='{disease}'"
        )

    filtered = filtered.sort_values(
        ["year", "week_number"]
    )

    row = filtered.iloc[-1]

    return predict_row(row)


def get_latest_predictions(
    district: Optional[str] = None,
    disease: Optional[str] = None,
) -> list[Dict[str, Any]]:
    """
    Generate latest Tier-1 predictions for all available
    district + disease combinations.
    """

    dataset = _load_dataset()

    if district:
        dataset = dataset[
            dataset["district"]
            .astype(str)
            .str.lower()
            == district.lower()
        ]

    if disease:
        dataset = dataset[
            dataset["disease"]
            .astype(str)
            .str.lower()
            == disease.lower()
        ]

    if dataset.empty:
        return []

    dataset = dataset.sort_values(
        ["year", "week_number"]
    )

    latest = (
        dataset
        .groupby(
            ["district", "disease"],
            as_index=False,
        )
        .tail(1)
    )

    return [
        predict_row(row)
        for _, row in latest.iterrows()
    ]


def get_model_info() -> Dict[str, Any]:
    metadata = _load_metadata()

    return {
        "model_version": metadata.get(
            "model_version",
            "tier1_v2",
        ),
        "feature_count": len(
            metadata.get("features", [])
        ),
        "features": metadata.get(
            "features",
            [],
        ),
        "tier": "Tier-1",
        "ensemble": [
            "XGBoost",
            "LightGBM",
            "CatBoost",
            "Logistic Meta Learner",
        ],
        "tier2_status": (
            "UNAVAILABLE_TIER2_DATA"
        ),
    }

