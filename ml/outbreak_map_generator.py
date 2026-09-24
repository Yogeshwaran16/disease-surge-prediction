import pandas as pd

df = pd.read_csv(
    "district_predictions.csv"
)

district_scores = (
    df.groupby("district")
    ["surge_probability"]
    .mean()
    .reset_index()
)

district_scores[
    "risk_score"
] = (
    district_scores[
        "surge_probability"
    ] * 100
).round(0)

def get_level(score):

    if score >= 70:
        return "HIGH"

    elif score >= 40:
        return "MEDIUM"

    return "LOW"

district_scores[
    "risk_level"
] = district_scores[
    "risk_score"
].apply(get_level)

district_scores[
    [
        "district",
        "risk_score",
        "risk_level"
    ]
].to_csv(
    "../backend/data/district_risk_scores.csv",
    index=False
)

print(
    "district_risk_scores.csv generated"
)