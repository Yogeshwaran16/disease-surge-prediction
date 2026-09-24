import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    recall_score,
    brier_score_loss,
    precision_score,
    f1_score,
)
from sklearn.preprocessing import StandardScaler

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "merged_dataset.csv"
MODEL_DIR = ROOT / "models"

MODEL_DIR.mkdir(exist_ok=True)


FEATURES = [
    "rainfall_mm",
    "max_temperature_c",
    "total_calls",
    "fever_calls",
    "total_opd",
    "fever_opd",
    "occupancy_rate_pct",
    "paracetamol_strips_sold",
    "dengue_diagnostic_kits",
    "aedes_larval_index",
]

TARGET = "surge"


def main():

    print("=" * 60)
    print("TECHNOVA MODULE 5 - TIER 1 ENSEMBLE")
    print("=" * 60)

    print("\nLoading dataset...")
    df = pd.read_csv(DATA_FILE)

    df = df.sort_values(
        ["year", "week_number", "district", "disease"]
    ).reset_index(drop=True)

    X = df[FEATURES].astype(float)
    y = df[TARGET].astype(int)

    # -------------------------------------------------
    # TIME-BASED SPLIT
    # -------------------------------------------------

    n = len(df)

    train_end = int(n * 0.70)
    validation_end = int(n * 0.85)

    X_train = X.iloc[:train_end]
    y_train = y.iloc[:train_end]

    X_val = X.iloc[train_end:validation_end]
    y_val = y.iloc[train_end:validation_end]

    X_test = X.iloc[validation_end:]
    y_test = y.iloc[validation_end:]

    print("\nDataset:")
    print("Total:", len(df))
    print("Train:", len(X_train))
    print("Validation:", len(X_val))
    print("Test:", len(X_test))

    # -------------------------------------------------
    # XGBOOST
    # -------------------------------------------------

    print("\nTraining XGBoost...")

    xgb_model = XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )

    xgb_model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    # -------------------------------------------------
    # LIGHTGBM
    # -------------------------------------------------

    print("Training LightGBM...")

    lgb_model = LGBMClassifier(
        n_estimators=250,
        learning_rate=0.08,
        num_leaves=31,
        max_depth=-1,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="binary",
        random_state=42,
        n_jobs=-1,
        verbosity=-1,
    )

    lgb_model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
    )

    # -------------------------------------------------
    # CATBOOST
    # -------------------------------------------------

    print("Training CatBoost...")

    cat_model = CatBoostClassifier(
        iterations=250,
        depth=6,
        learning_rate=0.08,
        loss_function="Logloss",
        eval_metric="Logloss",
        random_seed=42,
        verbose=False,
        thread_count=-1,
    )

    cat_model.fit(
        X_train,
        y_train,
        eval_set=(X_val, y_val),
        verbose=False,
    )

    # -------------------------------------------------
    # VALIDATION PREDICTIONS
    # -------------------------------------------------

    print("\nGenerating validation probabilities...")

    xgb_val = xgb_model.predict_proba(X_val)[:, 1]
    lgb_val = lgb_model.predict_proba(X_val)[:, 1]
    cat_val = cat_model.predict_proba(X_val)[:, 1]

    meta_X_val = np.column_stack(
        [xgb_val, lgb_val, cat_val]
    )

    # -------------------------------------------------
    # META LEARNER
    # -------------------------------------------------

    print("Training Logistic Meta-Learner...")

    meta_scaler = StandardScaler()

    meta_X_val_scaled = meta_scaler.fit_transform(
        meta_X_val
    )

    meta_model = LogisticRegression(
        max_iter=1000,
        random_state=42,
    )

    meta_model.fit(
        meta_X_val_scaled,
        y_val,
    )

    # -------------------------------------------------
    # TEST PREDICTIONS
    # -------------------------------------------------

    print("\nGenerating test predictions...")

    xgb_test = xgb_model.predict_proba(X_test)[:, 1]
    lgb_test = lgb_model.predict_proba(X_test)[:, 1]
    cat_test = cat_model.predict_proba(X_test)[:, 1]

    meta_X_test = np.column_stack(
        [xgb_test, lgb_test, cat_test]
    )

    meta_X_test_scaled = meta_scaler.transform(
        meta_X_test
    )

    final_probability = (
        meta_model.predict_proba(
            meta_X_test_scaled
        )[:, 1]
    )

    # -------------------------------------------------
    # HIGH-RISK THRESHOLD
    # -------------------------------------------------

    threshold = 0.70

    final_prediction = (
        final_probability >= threshold
    ).astype(int)

    # -------------------------------------------------
    # METRICS
    # -------------------------------------------------

    roc_auc = roc_auc_score(
        y_test,
        final_probability,
    )

    recall = recall_score(
        y_test,
        final_prediction,
        zero_division=0,
    )

    brier = brier_score_loss(
        y_test,
        final_probability,
    )

    precision = precision_score(
        y_test,
        final_prediction,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        final_prediction,
        zero_division=0,
    )

    metrics = {
        "roc_auc": float(roc_auc),
        "recall_at_0.70": float(recall),
        "brier_score": float(brier),
        "precision_at_0.70": float(precision),
        "f1_at_0.70": float(f1),
        "threshold": threshold,
        "train_rows": int(len(X_train)),
        "validation_rows": int(len(X_val)),
        "test_rows": int(len(X_test)),
    }

    print("\n" + "=" * 60)
    print("TIER-1 RESULTS")
    print("=" * 60)

    for key, value in metrics.items():
        print(f"{key}: {value}")

    # -------------------------------------------------
    # SAVE MODELS
    # -------------------------------------------------

    joblib.dump(
        xgb_model,
        MODEL_DIR / "xgboost_model.pkl",
    )

    joblib.dump(
        lgb_model,
        MODEL_DIR / "lightgbm_model.pkl",
    )

    joblib.dump(
        cat_model,
        MODEL_DIR / "catboost_model.pkl",
    )

    joblib.dump(
        meta_model,
        MODEL_DIR / "logistic_meta_model.pkl",
    )

    joblib.dump(
        meta_scaler,
        MODEL_DIR / "meta_scaler.pkl",
    )

    with open(
        MODEL_DIR / "tier1_metrics.json",
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            metrics,
            file,
            indent=2,
        )

    print("\nModels saved to:")
    print(MODEL_DIR)

    print("\nTIER-1 TRAINING COMPLETE")


if __name__ == "__main__":
    main()
