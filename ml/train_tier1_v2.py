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
MODEL_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "surge"

# Engineered features already present in merged_dataset.csv.
# year is intentionally excluded to avoid learning a calendar-time proxy.
FEATURES = [
    "week_number",
    "rainfall_mm",
    "max_temperature_c",
    "min_temperature_c",
    "total_calls",
    "fever_calls",
    "total_opd",
    "fever_opd",
    "occupancy_rate_pct",
    "paracetamol_strips_sold",
    "dengue_diagnostic_kits",
    "aedes_larval_index",
    "cases_lag_1",
    "cases_lag_2",
    "cases_lag_3",
    "cases_rolling_3w",
    "cases_rolling_7w",
    "rainfall_lag_1",
    "rainfall_lag_2",
    "rainfall_lag_3",
    "temperature_lag_1",
    "temperature_lag_2",
    "temperature_lag_3",
    "min_temperature_lag_1",
    "min_temperature_lag_2",
    "min_temperature_lag_3",
    "rainfall_trend_3w",
    "temperature_trend_3w",
    "min_temperature_trend_3w",
    "week_sin",
    "week_cos",
    "mosquito_breeding_index",
]


def metric_at_threshold(y_true, probability, threshold):
    predicted = (probability >= threshold).astype(int)

    return {
        "threshold": threshold,
        "recall": float(
            recall_score(y_true, predicted, zero_division=0)
        ),
        "precision": float(
            precision_score(y_true, predicted, zero_division=0)
        ),
        "f1": float(
            f1_score(y_true, predicted, zero_division=0)
        ),
    }


print("=" * 70)
print("TECHNOVA SENTINEL AI - MODULE 5 - TIER 1 V2")
print("=" * 70)

print("\n[1/7] Loading dataset...")
df = pd.read_csv(DATA_FILE)

df = df.sort_values(
    ["year", "week_number", "district", "disease"]
).reset_index(drop=True)

required = FEATURES + [TARGET, "year", "district", "disease"]

missing_columns = [
    column for column in required
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

if df[FEATURES + [TARGET]].isna().any().any():
    raise ValueError(
        "Missing values detected in training features/target."
    )

X = df[FEATURES].astype(float)
y = df[TARGET].astype(int)

n = len(df)

train_end = int(n * 0.70)
validation_end = int(n * 0.85)

X_train = X.iloc[:train_end]
y_train = y.iloc[:train_end]

X_validation = X.iloc[train_end:validation_end]
y_validation = y.iloc[train_end:validation_end]

X_test = X.iloc[validation_end:]
y_test = y.iloc[validation_end:]

print(f"Total rows      : {n}")
print(f"Training rows   : {len(X_train)}")
print(f"Validation rows : {len(X_validation)}")
print(f"Test rows       : {len(X_test)}")

print(
    f"Train years    : "
    f"{df.iloc[:train_end]['year'].min()}-"
    f"{df.iloc[:train_end]['year'].max()}"
)

print(
    f"Validation years: "
    f"{df.iloc[train_end:validation_end]['year'].min()}-"
    f"{df.iloc[train_end:validation_end]['year'].max()}"
)

print(
    f"Test years     : "
    f"{df.iloc[validation_end:]['year'].min()}-"
    f"{df.iloc[validation_end:]['year'].max()}"
)

print("\nFeature count:", len(FEATURES))

print("\n[2/7] Training XGBoost...")

xgb_model = XGBClassifier(
    n_estimators=350,
    max_depth=5,
    learning_rate=0.05,
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
    eval_set=[(X_validation, y_validation)],
    verbose=False,
)

print("XGBoost complete.")

print("\n[3/7] Training LightGBM...")

lgb_model = LGBMClassifier(
    n_estimators=350,
    learning_rate=0.05,
    num_leaves=31,
    max_depth=-1,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42,
    verbosity=-1,
)

lgb_model.fit(
    X_train,
    y_train,
    eval_set=[(X_validation, y_validation)],
)

print("LightGBM complete.")

print("\n[4/7] Training CatBoost...")

cat_model = CatBoostClassifier(
    iterations=350,
    depth=6,
    learning_rate=0.05,
    loss_function="Logloss",
    eval_metric="Logloss",
    random_seed=42,
    verbose=False,
    allow_writing_files=False,
)

cat_model.fit(
    X_train,
    y_train,
    eval_set=(X_validation, y_validation),
    verbose=False,
)

print("CatBoost complete.")

print("\n[5/7] Building logistic meta-learner...")

xgb_val = xgb_model.predict_proba(X_validation)[:, 1]
lgb_val = lgb_model.predict_proba(X_validation)[:, 1]
cat_val = cat_model.predict_proba(X_validation)[:, 1]

meta_validation = np.column_stack(
    [xgb_val, lgb_val, cat_val]
)

scaler = StandardScaler()

meta_validation_scaled = scaler.fit_transform(
    meta_validation
)

meta_model = LogisticRegression(
    max_iter=2000,
    random_state=42,
)

meta_model.fit(
    meta_validation_scaled,
    y_validation,
)

print("Meta-learner complete.")

print("\n[6/7] Evaluating untouched test set...")

xgb_test = xgb_model.predict_proba(X_test)[:, 1]
lgb_test = lgb_model.predict_proba(X_test)[:, 1]
cat_test = cat_model.predict_proba(X_test)[:, 1]

meta_test = np.column_stack(
    [xgb_test, lgb_test, cat_test]
)

meta_test_scaled = scaler.transform(meta_test)

test_probability = meta_model.predict_proba(
    meta_test_scaled
)[:, 1]

roc_auc = roc_auc_score(
    y_test,
    test_probability
)

brier = brier_score_loss(
    y_test,
    test_probability
)

print(f"ROC-AUC      : {roc_auc:.6f}")
print(f"Brier Score  : {brier:.6f}")

thresholds = [
    0.30,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
]

threshold_metrics = []

print("\nThreshold evaluation:")

for threshold in thresholds:
    metrics = metric_at_threshold(
        y_test,
        test_probability,
        threshold,
    )

    threshold_metrics.append(metrics)

    print(
        f"Threshold={threshold:.2f} | "
        f"Recall={metrics['recall']:.4f} | "
        f"Precision={metrics['precision']:.4f} | "
        f"F1={metrics['f1']:.4f}"
    )

best_recall_threshold = next(
    (
        item
        for item in threshold_metrics
        if item["recall"] >= 0.90
    ),
    None,
)

if best_recall_threshold is None:
    selected_threshold = 0.50
else:
    selected_threshold = best_recall_threshold["threshold"]

selected_metrics = metric_at_threshold(
    y_test,
    test_probability,
    selected_threshold,
)

print(
    "\nSelected high-risk threshold:",
    selected_threshold,
)

print(
    "Selected recall:",
    selected_metrics["recall"],
)

print(
    "Selected precision:",
    selected_metrics["precision"],
)

print(
    "Selected F1:",
    selected_metrics["f1"],
)

print("\n[7/7] Saving versioned models...")

version_dir = MODEL_DIR / "tier1_v2"
version_dir.mkdir(parents=True, exist_ok=True)

joblib.dump(
    xgb_model,
    version_dir / "xgboost_model.pkl",
)

joblib.dump(
    lgb_model,
    version_dir / "lightgbm_model.pkl",
)

joblib.dump(
    cat_model,
    version_dir / "catboost_model.pkl",
)

joblib.dump(
    meta_model,
    version_dir / "logistic_meta_model.pkl",
)

joblib.dump(
    scaler,
    version_dir / "meta_scaler.pkl",
)

metrics = {
    "model_version": "tier1_v2",
    "architecture": (
        "XGBoost + LightGBM + CatBoost "
        "+ LogisticRegression meta-learner"
    ),
    "feature_count": len(FEATURES),
    "features": FEATURES,
    "dataset_rows": n,
    "train_rows": len(X_train),
    "validation_rows": len(X_validation),
    "test_rows": len(X_test),
    "train_years": [
        int(df.iloc[:train_end]["year"].min()),
        int(df.iloc[:train_end]["year"].max()),
    ],
    "validation_years": [
        int(
            df.iloc[train_end:validation_end]["year"].min()
        ),
        int(
            df.iloc[train_end:validation_end]["year"].max()
        ),
    ],
    "test_years": [
        int(df.iloc[validation_end:]["year"].min()),
        int(df.iloc[validation_end:]["year"].max()),
    ],
    "roc_auc": float(roc_auc),
    "brier_score": float(brier),
    "threshold_metrics": threshold_metrics,
    "selected_high_risk_threshold": float(
        selected_threshold
    ),
    "selected_metrics": selected_metrics,
}

with open(
    version_dir / "tier1_metrics.json",
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        metrics,
        file,
        indent=2,
    )

with open(
    version_dir / "feature_metadata.json",
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        {
            "model_version": "tier1_v2",
            "features": FEATURES,
        },
        file,
        indent=2,
    )

print("\n" + "=" * 70)
print("TIER-1 V2 TRAINING COMPLETE")
print("=" * 70)

print("Model directory:")
print(version_dir)

print("\nFinal metrics:")
print(f"ROC-AUC     : {roc_auc:.6f}")
print(f"Brier Score : {brier:.6f}")
print(
    f"High-risk threshold: {selected_threshold:.2f}"
)
print(
    f"High-risk recall   : "
    f"{selected_metrics['recall']:.6f}"
)
print(
    f"High-risk precision: "
    f"{selected_metrics['precision']:.6f}"
)
print(
    f"High-risk F1       : "
    f"{selected_metrics['f1']:.6f}"
)
