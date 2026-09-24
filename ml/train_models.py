import pandas as pd
import joblib

from sklearn.model_selection import train_test_split

from sklearn.preprocessing import StandardScaler

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    classification_report
)

# =====================================================
# LOAD
# =====================================================

df = pd.read_csv(
    "merged_dataset.csv"
)

# =====================================================
# FEATURES
# =====================================================

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

    "aedes_larval_index"
]

TARGET = "surge"

X = df[FEATURES]

y = df[TARGET]

# =====================================================
# SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# =====================================================
# SCALE
# =====================================================

scaler = StandardScaler()

X_train = scaler.fit_transform(
    X_train
)

X_test = scaler.transform(
    X_test
)

# =====================================================
# MODEL
# =====================================================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

# =====================================================
# EVALUATION
# =====================================================

preds = model.predict(
    X_test
)

acc = accuracy_score(
    y_test,
    preds
)

print("\nAccuracy:", acc)

print(
    classification_report(
        y_test,
        preds
    )
)

# =====================================================
# SAVE
# =====================================================

joblib.dump(
    model,
    "model.pkl"
)

joblib.dump(
    scaler,
    "scaler.pkl"
)

print("model.pkl saved")

print("scaler.pkl saved")