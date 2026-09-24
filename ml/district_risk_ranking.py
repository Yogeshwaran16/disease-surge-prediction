import os
import pandas as pd

INPUT_FILE = "district_predictions.csv"

OUTPUT_DIR = "../backend/data"

OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "district_risk_scores.csv"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

print("Loading predictions...")

df = pd.read_csv(INPUT_FILE)

# ====================================
# ONE RECORD PER DISTRICT
# ====================================

district_df = (
    df.groupby("district")["surge_probability"]
    .mean()
    .reset_index()
)

district_df["risk_score"] = (
    district_df["surge_probability"] * 100
).round(2)

# ====================================
# RISK LEVEL
# ====================================

def get_risk_level(score):

    if score >= 70:
        return "HIGH"

    elif score >= 40:
        return "MEDIUM"

    else:
        return "LOW"


district_df["risk_level"] = (
    district_df["risk_score"]
    .apply(get_risk_level)
)

# ====================================
# SORT
# ====================================

district_df = district_df.sort_values(
    "risk_score",
    ascending=False
)

district_df["rank"] = range(
    1,
    len(district_df) + 1
)

final_df = district_df[
    [
        "rank",
        "district",
        "risk_score",
        "risk_level"
    ]
]

final_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print(final_df.head())

print(
    f"\nGenerated {len(final_df)} districts"
)