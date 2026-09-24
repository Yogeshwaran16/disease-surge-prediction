import pandas as pd
import numpy as np
import joblib

# =====================================================
# LOAD
# =====================================================

model = joblib.load(
    "model.pkl"
)

scaler = joblib.load(
    "scaler.pkl"
)

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

X = df[FEATURES]

X = scaler.transform(X)

# =====================================================
# PREDICT
# =====================================================

prob = model.predict_proba(X)[:, 1]

df["surge_probability"] = prob

# =====================================================
# RISK LEVEL
# =====================================================

conditions = [

    df["surge_probability"] >= 0.70,

    df["surge_probability"] >= 0.40
]

choices = [
    "HIGH",
    "MEDIUM"
]

df["risk_level"] = np.select(
    conditions,
    choices,
    default="LOW"
)

# =====================================================
# EXPECTED CASES
# =====================================================

df["expected_cases_2w"] = (
    df["no_of_cases"] *
    (1 + df["surge_probability"])
).astype(int)

# =====================================================
# OUTPUT
# =====================================================

output = df[
    [
        "district",
        "disease",
        "year",
        "week_number",
        "surge_probability",
        "expected_cases_2w",
        "risk_level"
    ]
]

output.to_csv(
    "district_predictions.csv",
    index=False
)

print(
    "district_predictions.csv generated"
)