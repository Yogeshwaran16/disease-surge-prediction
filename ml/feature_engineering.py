from pathlib import Path
from datetime import datetime
import json

import pandas as pd
import numpy as np

# =====================================================
# PATH CONFIGURATION
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

IDSP_FILE = DATA_DIR / "TamilNadu_IDSP_AllYears.csv"
RAINFALL_FILE = DATA_DIR / "TamilNadu_IMD_Rainfall_2015_2025.csv"
MAX_TEMP_FILE = DATA_DIR / "TamilNadu_IMD_MaxTemperature_2015_2025.csv"
MIN_TEMP_FILE = DATA_DIR / "TamilNadu_Districtwise_MinTemperature_Formatted.csv"

AEDES_FILE = DATA_DIR / "Aedes_LarvalIndex_Fortnightly_2015_2025.csv"
EMRI_FILE = DATA_DIR / "EMRI_108_AmbulanceCalls_2015_2025.csv"
PHC_FILE = DATA_DIR / "PHC_OPD_DailyRegistration_2015_2025.csv"
BED_FILE = DATA_DIR / "HospitalBedOccupancy_Weekly_2015_2025.csv"
PHARMACY_FILE = DATA_DIR / "Pharmacy_OTC_Sales_Weekly_2015_2025.csv"
TNMSC_FILE = DATA_DIR / "TNMSC_MedicineIndent_Weekly_2015_2025.csv"

OUTPUT_FILE = BASE_DIR / "ml" / "merged_dataset.csv"
FEATURE_VERSION = "v1.0.0"
FEATURE_METADATA_FILE = BASE_DIR / "ml" / "feature_metadata.json"

# =====================================================
# LOAD DATA
# =====================================================

print("Loading datasets...")

idsp = pd.read_csv(IDSP_FILE)
rain = pd.read_csv(RAINFALL_FILE)
max_temp = pd.read_csv(MAX_TEMP_FILE)
min_temp = pd.read_csv(MIN_TEMP_FILE)

aedes = pd.read_csv(AEDES_FILE)
emri = pd.read_csv(EMRI_FILE)
phc = pd.read_csv(PHC_FILE)
bed = pd.read_csv(BED_FILE)
pharmacy = pd.read_csv(PHARMACY_FILE)
tnmsc = pd.read_csv(TNMSC_FILE)


# =====================================================
# WEEKLY AGGREGATION
# =====================================================

print("Aggregating datasets...")


# -----------------------------------------------------
# Rainfall: Daily → Weekly
# -----------------------------------------------------

rain_weekly = (
    rain.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        rainfall_mm=("rainfall_mm", "sum")
    )
)


# -----------------------------------------------------
# Maximum Temperature: Daily → Weekly
# -----------------------------------------------------

max_temp_weekly = (
    max_temp.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        max_temperature_c=("max_temperature_c", "mean")
    )
)


# -----------------------------------------------------
# Minimum Temperature: Daily → Weekly
# -----------------------------------------------------

min_temp_weekly = (
    min_temp.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        min_temperature_c=("min_temperature_c", "mean")
    )
)


# -----------------------------------------------------
# EMRI: Daily → Weekly
# -----------------------------------------------------

emri_weekly = (
    emri.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        total_calls=("total_calls", "sum"),
        fever_calls=("fever_calls", "sum")
    )
)


# -----------------------------------------------------
# PHC OPD: Daily → Weekly
# -----------------------------------------------------

phc_weekly = (
    phc.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        total_opd=("total_opd", "sum"),
        fever_opd=("fever_opd", "sum")
    )
)


# -----------------------------------------------------
# Hospital Bed Occupancy: Weekly
# -----------------------------------------------------

bed_weekly = (
    bed.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        total_bed_capacity=("total_bed_capacity", "sum"),
        total_occupied_beds=("total_occupied_beds", "sum"),
        dengue_beds_occupied=("dengue_beds_occupied", "sum"),
        heat_stroke_beds_occupied=("heat_stroke_beds_occupied", "sum"),
        gastroenteritis_beds_occupied=("gastroenteritis_beds_occupied", "sum"),
        respiratory_beds_occupied=("respiratory_beds_occupied", "sum")
    )
)

bed_weekly["occupancy_rate_pct"] = np.where(
    bed_weekly["total_bed_capacity"] > 0,
    (
        bed_weekly["total_occupied_beds"]
        / bed_weekly["total_bed_capacity"]
    ) * 100,
    0
)


# -----------------------------------------------------
# Pharmacy: Weekly
# -----------------------------------------------------

pharmacy_weekly = (
    pharmacy.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        paracetamol_strips_sold=("paracetamol_strips_sold", "sum"),
        ors_packets_sold=("ors_packets_sold", "sum"),
        antipyretic_tablets_sold=("antipyretic_tablets_sold", "sum"),
        antidiarrheal_tablets_sold=("antidiarrheal_tablets_sold", "sum"),
        cough_cold_tablets_sold=("cough_cold_tablets_sold", "sum")
    )
)


# -----------------------------------------------------
# TNMSC: Weekly
# -----------------------------------------------------

tnmsc_weekly = (
    tnmsc.groupby(
        ["district", "year", "week_number"],
        as_index=False
    )
    .agg(
        dengue_diagnostic_kits=("dengue_diagnostic_kits", "sum"),
        iv_fluids_units=("iv_fluids_units", "sum"),
        paracetamol_strips=("paracetamol_strips", "sum"),
        ors_packets=("ors_packets", "sum"),
        antibiotics_courses=("antibiotics_courses", "sum"),
        dengue_rapid_test_kits=("dengue_rapid_test_kits", "sum")
    )
)


# -----------------------------------------------------
# Aedes: Fortnightly → District-Year Average
# -----------------------------------------------------

aedes_weekly = (
    aedes.groupby(
        ["district", "year"],
        as_index=False
    )
    .agg(
        aedes_larval_index=("aedes_larval_index", "mean")
    )
)


# =====================================================
# MERGE DATASETS
# =====================================================

print("Merging datasets...")


# -----------------------------------------------------
# IDSP + Weekly Rainfall
# -----------------------------------------------------

df = idsp.merge(
    rain_weekly,
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly Maximum Temperature
# -----------------------------------------------------

df = df.merge(
    max_temp_weekly,
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly Minimum Temperature
# -----------------------------------------------------

df = df.merge(
    min_temp_weekly,
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly EMRI
# -----------------------------------------------------

df = df.merge(
    emri_weekly,
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly PHC OPD
# -----------------------------------------------------

df = df.merge(
    phc_weekly,
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly Hospital Bed Occupancy
# -----------------------------------------------------

df = df.merge(
    bed_weekly[
        [
            "district",
            "year",
            "week_number",
            "occupancy_rate_pct"
        ]
    ],
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly Pharmacy Sales
# -----------------------------------------------------

df = df.merge(
    pharmacy_weekly[
        [
            "district",
            "year",
            "week_number",
            "paracetamol_strips_sold"
        ]
    ],
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Weekly TNMSC Medicine Indent
# -----------------------------------------------------

df = df.merge(
    tnmsc_weekly[
        [
            "district",
            "year",
            "week_number",
            "dengue_diagnostic_kits"
        ]
    ],
    on=["district", "year", "week_number"],
    how="left",
    validate="many_to_one"
)


# -----------------------------------------------------
# + Aedes Larval Index
# -----------------------------------------------------

df = df.merge(
    aedes_weekly,
    on=["district", "year"],
    how="left",
    validate="many_to_one"
)


# =====================================================
# FILL MISSING NUMERIC VALUES
# =====================================================

print("Handling missing numeric values...")

numeric_cols = df.select_dtypes(
    include=["number"]
).columns

df[numeric_cols] = df[numeric_cols].fillna(0)


# =====================================================
# TIME-SERIES SORTING
# =====================================================

print("Sorting time-series data...")

df = df.sort_values(
    ["district", "disease", "year", "week_number"]
).reset_index(drop=True)


# =====================================================
# LAG FEATURES
# =====================================================

print("Creating lag features...")

group_cols = ["district", "disease"]


# -----------------------------------------------------
# Case-count lags
# -----------------------------------------------------

df["cases_lag_1"] = (
    df.groupby(group_cols)["no_of_cases"]
    .shift(1)
)

df["cases_lag_2"] = (
    df.groupby(group_cols)["no_of_cases"]
    .shift(2)
)

df["cases_lag_3"] = (
    df.groupby(group_cols)["no_of_cases"]
    .shift(3)
)


# -----------------------------------------------------
# Rolling case features
# -----------------------------------------------------

print("Creating rolling features...")

df["cases_rolling_3w"] = (
    df.groupby(group_cols)["no_of_cases"]
    .transform(
        lambda x: x.shift(1).rolling(
            window=3,
            min_periods=1
        ).mean()
    )
)

df["cases_rolling_7w"] = (
    df.groupby(group_cols)["no_of_cases"]
    .transform(
        lambda x: x.shift(1).rolling(
            window=7,
            min_periods=1
        ).mean()
    )
)


# =====================================================
# WEATHER LAG FEATURES
# =====================================================

print("Creating weather lag features...")


# -----------------------------------------------------
# Rainfall lags
# -----------------------------------------------------

df["rainfall_lag_1"] = (
    df.groupby(group_cols)["rainfall_mm"]
    .shift(1)
)

df["rainfall_lag_2"] = (
    df.groupby(group_cols)["rainfall_mm"]
    .shift(2)
)

df["rainfall_lag_3"] = (
    df.groupby(group_cols)["rainfall_mm"]
    .shift(3)
)


# -----------------------------------------------------
# Maximum temperature lags
# -----------------------------------------------------

df["temperature_lag_1"] = (
    df.groupby(group_cols)["max_temperature_c"]
    .shift(1)
)

df["temperature_lag_2"] = (
    df.groupby(group_cols)["max_temperature_c"]
    .shift(2)
)

df["temperature_lag_3"] = (
    df.groupby(group_cols)["max_temperature_c"]
    .shift(3)
)


# -----------------------------------------------------
# Minimum temperature lags
# -----------------------------------------------------

df["min_temperature_lag_1"] = (
    df.groupby(group_cols)["min_temperature_c"]
    .shift(1)
)

df["min_temperature_lag_2"] = (
    df.groupby(group_cols)["min_temperature_c"]
    .shift(2)
)

df["min_temperature_lag_3"] = (
    df.groupby(group_cols)["min_temperature_c"]
    .shift(3)
)


# =====================================================
# FILL INITIAL LAG VALUES
# =====================================================

print("Handling initial lag values...")

lag_cols = [
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
    "min_temperature_lag_3"
]

df[lag_cols] = df[lag_cols].fillna(0)


# =====================================================
# TREND FEATURES
# =====================================================

print("Creating weather trend features...")


# -----------------------------------------------------
# Previous 3-week rainfall trend
# -----------------------------------------------------

df["rainfall_trend_3w"] = (
    df.groupby(group_cols)["rainfall_mm"]
    .transform(
        lambda x: x.shift(1).rolling(
            window=3,
            min_periods=2
        ).apply(
            lambda y: np.polyfit(
                np.arange(len(y)),
                y,
                1
            )[0]
            if len(y) >= 2 else 0,
            raw=True
        )
    )
)


# -----------------------------------------------------
# Previous 3-week maximum temperature trend
# -----------------------------------------------------

df["temperature_trend_3w"] = (
    df.groupby(group_cols)["max_temperature_c"]
    .transform(
        lambda x: x.shift(1).rolling(
            window=3,
            min_periods=2
        ).apply(
            lambda y: np.polyfit(
                np.arange(len(y)),
                y,
                1
            )[0]
            if len(y) >= 2 else 0,
            raw=True
        )
    )
)


# -----------------------------------------------------
# Previous 3-week minimum temperature trend
# -----------------------------------------------------

df["min_temperature_trend_3w"] = (
    df.groupby(group_cols)["min_temperature_c"]
    .transform(
        lambda x: x.shift(1).rolling(
            window=3,
            min_periods=2
        ).apply(
            lambda y: np.polyfit(
                np.arange(len(y)),
                y,
                1
            )[0]
            if len(y) >= 2 else 0,
            raw=True
        )
    )
)


df["rainfall_trend_3w"] = (
    df["rainfall_trend_3w"].fillna(0)
)

df["temperature_trend_3w"] = (
    df["temperature_trend_3w"].fillna(0)
)

df["min_temperature_trend_3w"] = (
    df["min_temperature_trend_3w"].fillna(0)
)


# =====================================================
# CYCLICAL SEASON ENCODING
# =====================================================

print("Creating seasonal encoding...")

df["week_sin"] = np.sin(
    2 * np.pi * df["week_number"] / 52
)

df["week_cos"] = np.cos(
    2 * np.pi * df["week_number"] / 52
)


# =====================================================
# MOSQUITO BREEDING INDEX (MBI)
# =====================================================

print("Creating Mosquito Breeding Index...")


aedes_mbi = (
    aedes.groupby(
        ["district", "year"],
        as_index=False
    )
    .agg(
        aedes_larval_index=("aedes_larval_index", "mean"),
        house_index=("house_index", "mean"),
        container_index=("container_index", "mean")
    )
)


for col in [
    "aedes_larval_index",
    "house_index",
    "container_index"
]:

    min_value = aedes_mbi[col].min()
    max_value = aedes_mbi[col].max()

    if max_value > min_value:
        aedes_mbi[f"{col}_norm"] = (
            (aedes_mbi[col] - min_value)
            / (max_value - min_value)
        )
    else:
        aedes_mbi[f"{col}_norm"] = 0


aedes_mbi["mosquito_breeding_index"] = (
    aedes_mbi["aedes_larval_index_norm"]
    + aedes_mbi["house_index_norm"]
    + aedes_mbi["container_index_norm"]
) / 3


aedes_mbi = aedes_mbi[
    [
        "district",
        "year",
        "mosquito_breeding_index"
    ]
]


df = df.merge(
    aedes_mbi,
    on=["district", "year"],
    how="left",
    validate="many_to_one"
)

df["mosquito_breeding_index"] = (
    df["mosquito_breeding_index"].fillna(0)
)


# =====================================================
# CREATE SURGE TARGET
# =====================================================

print("Creating surge target...")

district_avg = (
    df.groupby("district")["no_of_cases"]
    .transform("mean")
)

df["surge"] = np.where(
    df["no_of_cases"] > district_avg,
    1,
    0
)


# =====================================================
# DATA VALIDATION
# =====================================================

print("Validating merged dataset...")

print("IDSP rows:", len(idsp))
print("Final rows:", len(df))
print("Final columns:", len(df.columns))


print("\nMissing values:")

missing = df.isna().sum()
print(missing[missing > 0])


print("\nDuplicate merge keys in final dataset:")

duplicate_keys = (
    df.groupby(
        ["district", "year", "week_number"]
    )
    .size()
)

print(
    "Keys with multiple disease records:",
    (duplicate_keys > 1).sum()
)


# =====================================================
# SAVE DATASET
# =====================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\nSaved:", OUTPUT_FILE)

print("\nFirst 5 rows:")
print(df.head())

# =====================================================
# FEATURE METADATA
# =====================================================

latest_year = int(df["year"].max())

latest_week = int(
    df.loc[
        df["year"] == latest_year,
        "week_number"
    ].max()
)

metadata = {
    "feature_version": FEATURE_VERSION,
    "generated_at": datetime.now().isoformat(),
    "output_file": str(OUTPUT_FILE),
    "row_count": int(len(df)),
    "column_count": int(len(df.columns)),
    "columns": df.columns.tolist(),
    "latest_year": latest_year,
    "latest_week": latest_week,
    "district_count": int(df["district"].nunique()),
    "disease_count": int(df["disease"].nunique())
}

with open(
    FEATURE_METADATA_FILE,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        metadata,
        f,
        indent=4
    )

print(f"Feature version: {FEATURE_VERSION}")
print(f"Metadata saved: {FEATURE_METADATA_FILE}")

with open(FEATURE_METADATA_FILE, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=4)

print(f"Feature version: {FEATURE_VERSION}")
print(f"Metadata saved: {FEATURE_METADATA_FILE}")

# ============================================================
# FEATURE FRESHNESS VALIDATION
# ============================================================

print("\nValidating feature freshness...")

REQUIRED_FEATURES = [
    "district",
    "disease",
    "year",
    "week_number",
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
    "surge"
]

missing_required = [
    col for col in REQUIRED_FEATURES
    if col not in df.columns
]

if missing_required:
    print("Freshness validation: FAILED")
    print("Missing required features:")
    for col in missing_required:
        print(f" - {col}")
else:
    latest_year = int(df["year"].max())

    latest_week = int(
        df.loc[df["year"] == latest_year, "week_number"].max()
    )

    district_count = int(df["district"].nunique())
    disease_count = int(df["disease"].nunique())

    print("Freshness validation: PASS")
    print(f"Latest data: {latest_year}-W{latest_week}")
    print(f"Districts: {district_count}")
    print(f"Diseases: {disease_count}")
    print(f"Required features: {len(REQUIRED_FEATURES)}/{len(REQUIRED_FEATURES)}")

    metadata["freshness_validation"] = {
        "status": "PASS",
        "latest_year": latest_year,
        "latest_week": latest_week,
        "district_count": district_count,
        "disease_count": disease_count,
        "required_features": len(REQUIRED_FEATURES)
    }

    with open(FEATURE_METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)

    print(f"Updated metadata: {FEATURE_METADATA_FILE}")