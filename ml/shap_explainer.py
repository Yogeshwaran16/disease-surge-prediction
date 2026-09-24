import os
import json
import joblib
import pandas as pd
import numpy as np
import shap

# =====================================================
# CREATE OUTPUT DIRECTORY
# =====================================================

os.makedirs(
    "../backend/data",
    exist_ok=True
)

# =====================================================
# LOAD MODEL
# =====================================================

print("Loading model...")

model = joblib.load("model.pkl")

# =====================================================
# LOAD DATA
# =====================================================

df = pd.read_csv("merged_dataset.csv")

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

# =====================================================
# SAMPLE DATA
# =====================================================

sample_size = 1000

if len(df) > sample_size:

    print(
        f"Large dataset detected ({len(df)} rows)"
    )

    print(
        f"Using sample of {sample_size} rows"
    )

    sample_df = df.sample(
        n=sample_size,
        random_state=42
    )

else:

    sample_df = df.copy()

X_sample = sample_df[FEATURES]

# =====================================================
# GENERATE SHAP VALUES
# =====================================================

print("Generating SHAP values...")

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(X_sample)

# =====================================================
# HANDLE DIFFERENT SHAP OUTPUT SHAPES
# =====================================================

if isinstance(shap_values, list):

    # Binary classification
    shap_array = shap_values[1]

else:

    shap_array = shap_values

    if len(shap_array.shape) == 3:

        # Shape: (rows, features, classes)
        shap_array = shap_array[:, :, 1]

print(
    "SHAP shape:",
    shap_array.shape
)

# =====================================================
# BUILD RESULTS
# =====================================================

results = []

for district in sample_df["district"].unique():

    district_rows = sample_df[
        sample_df["district"] == district
    ]

    if district_rows.empty:
        continue

    sample_indexes = []

    for idx in district_rows.index:

        try:

            local_idx = sample_df.index.get_loc(
                idx
            )

            sample_indexes.append(
                local_idx
            )

        except:

            continue

    if len(sample_indexes) == 0:
        continue

    impacts = []

    for i, feature in enumerate(FEATURES):

        impact = np.mean(
            np.abs(
                shap_array[
                    sample_indexes,
                    i
                ]
            )
        )

        impacts.append({

            "feature": feature,

            "impact": round(
                float(impact),
                6
            )
        })

    impacts = sorted(
        impacts,
        key=lambda x: x["impact"],
        reverse=True
    )

    results.append({

        "district": district,

        "features": impacts[:10]
    })

# =====================================================
# SAVE OUTPUT
# =====================================================

OUTPUT_FILE = (
    "../backend/data/shap_output.json"
)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        results,
        f,
        indent=4,
        ensure_ascii=False
    )

print(
    f"\nSHAP output generated: {OUTPUT_FILE}"
)

print(
    f"Districts processed: {len(results)}"
)