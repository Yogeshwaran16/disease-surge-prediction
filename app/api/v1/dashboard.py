from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv
from collections import defaultdict
from datetime import datetime


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================
# DATA FILE
# ============================================

BASE_DIR = Path(__file__).resolve().parents[3]

PREDICTIONS_FILE = (
    BASE_DIR
    / "ml"
    / "district_predictions.csv"
)


# ============================================
# HELPERS
# ============================================

def load_predictions():
    """
    Load prediction data from the project's
    district_predictions.csv file.
    """

    if not PREDICTIONS_FILE.exists():
        return []

    rows = []

    with open(
        PREDICTIONS_FILE,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            try:
                rows.append(
                    {
                        "district": str(
                            row.get("district", "")
                        ).strip(),

                        "disease": str(
                            row.get("disease", "")
                        ).strip(),

                        "year": int(
                            row.get("year", 0)
                        ),

                        "week_number": int(
                            row.get(
                                "week_number",
                                0,
                            )
                        ),

                        "surge_probability": float(
                            row.get(
                                "surge_probability",
                                0,
                            )
                        ),

                        "expected_cases_2w": int(
                            float(
                                row.get(
                                    "expected_cases_2w",
                                    0,
                                )
                            )
                        ),

                        "risk_level": str(
                            row.get(
                                "risk_level",
                                "LOW",
                            )
                        ).strip().upper(),
                    }
                )

            except (
                ValueError,
                TypeError,
            ):
                continue

    return rows


def get_latest_predictions():
    """
    Get the latest available prediction for
    every district + disease combination.
    """

    rows = load_predictions()

    if not rows:
        return []

    latest_period = max(
        (
            row["year"],
            row["week_number"],
        )
        for row in rows
    )

    latest_by_key = {}

    for row in rows:

        key = (
            row["district"],
            row["disease"],
        )

        current = latest_by_key.get(key)

        if (
            current is None
            or (
                row["year"],
                row["week_number"],
            )
            > (
                current["year"],
                current["week_number"],
            )
        ):
            latest_by_key[key] = row

    return list(
        latest_by_key.values()
    )


def build_district_summary():
    """
    Build one dashboard record per district.

    For each district, the disease with the
    highest surge probability is used as the
    district's current dashboard risk.
    """

    rows = get_latest_predictions()

    grouped = defaultdict(list)

    for row in rows:
        grouped[
            row["district"]
        ].append(row)

    district_data = []

    for district, records in grouped.items():

        if not records:
            continue

        # Highest current surge probability
        representative = max(
            records,
            key=lambda item:
                item["surge_probability"]
        )

        district_data.append(
            {
                "district": district,

                "disease": representative[
                    "disease"
                ],

                "surge_probability":
                    representative[
                        "surge_probability"
                    ],

                "expected_cases_2w":
                    representative[
                        "expected_cases_2w"
                    ],

                "risk_level":
                    representative[
                        "risk_level"
                    ],

                "year":
                    representative["year"],

                "week_number":
                    representative[
                        "week_number"
                    ],
            }
        )

    return district_data


# ============================================
# HEALTH
# ============================================

@router.get("/health")
def dashboard_health():

    return {
        "success": True,
        "service": "Dashboard",
        "status": "healthy",
    }


# ============================================
# SUMMARY
# ============================================

@router.get("/summary")
def get_dashboard_summary():

    district_data = (
        build_district_summary()
    )

    high = sum(
        1
        for item in district_data
        if item["risk_level"]
        == "HIGH"
    )

    medium = sum(
        1
        for item in district_data
        if item["risk_level"]
        == "MEDIUM"
    )

    low = sum(
        1
        for item in district_data
        if item["risk_level"]
        == "LOW"
    )

    critical = sum(
        1
        for item in district_data
        if item["risk_level"]
        == "CRITICAL"
    )

    latest_rows = load_predictions()

    if latest_rows:

        latest_period = max(
            (
                row["year"],
                row["week_number"],
            )
            for row in latest_rows
        )

        last_updated = (
            f"{latest_period[0]}-W"
            f"{latest_period[1]:02d}"
        )

    else:

        last_updated = None

    return {

        "success": True,

        "message":
            "Dashboard summary retrieved successfully",

        "total_districts":
            len(district_data),

        "total_predictions":
            len(district_data),

        "high_risk":
            high,

        "medium_risk":
            medium,

        "low_risk":
            low,

        "critical_risk":
            critical,

        "risk_counts": {

            "HIGH":
                high,

            "MEDIUM":
                medium,

            "LOW":
                low,

            "CRITICAL":
                critical,
        },

        "all_districts":
            district_data,

        "last_updated":
            last_updated,
    }


# ============================================
# ALERTS
# ============================================

@router.get("/alerts")
def get_dashboard_alerts():

    district_data = (
        build_district_summary()
    )

    alerts = [
        item
        for item in district_data
        if item["risk_level"]
        in [
            "HIGH",
            "CRITICAL",
        ]
    ]

    return {
        "success": True,
        "data": alerts,
    }


# ============================================
# PREDICTIONS
# ============================================
# ============================================================
# MODULE 9 - HISTORICAL RISK TREND
# ============================================================

@router.get("/trend")
def get_dashboard_risk_trend(
    weeks: int = 12,
):
    """
    Return historical weekly district-level risk counts.

    Source:
        ml/district_predictions.csv

    Output:
        Weekly HIGH / MEDIUM / LOW / CRITICAL counts.

    Module 5 Prediction Engine remains unchanged.
    """

    from pathlib import Path
    import pandas as pd

    # --------------------------------------------------------
    # Validate requested number of weeks
    # --------------------------------------------------------

    try:
        weeks = int(weeks)
    except (TypeError, ValueError):
        weeks = 12

    weeks = max(
        4,
        min(52, weeks),
    )

    # --------------------------------------------------------
    # Locate prediction dataset
    # --------------------------------------------------------

    project_root = (
        Path(__file__)
        .resolve()
        .parents[3]
    )

    predictions_file = (
        project_root
        / "ml"
        / "district_predictions.csv"
    )

    if not predictions_file.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                "Dashboard prediction dataset "
                "was not found."
            ),
        )

    # --------------------------------------------------------
    # Load only required columns
    # --------------------------------------------------------

    required_columns = [
        "year",
        "week_number",
        "risk_level",
    ]

    try:

        dataframe = pd.read_csv(
            predictions_file,
            usecols=required_columns,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load dashboard "
                f"trend data: {error}"
            ),
        )

    # --------------------------------------------------------
    # Clean values
    # --------------------------------------------------------

    dataframe["year"] = pd.to_numeric(
        dataframe["year"],
        errors="coerce",
    )

    dataframe["week_number"] = pd.to_numeric(
        dataframe["week_number"],
        errors="coerce",
    )

    dataframe["risk_level"] = (
        dataframe["risk_level"]
        .fillna("LOW")
        .astype(str)
        .str.upper()
        .str.strip()
    )

    dataframe = dataframe.dropna(
        subset=[
            "year",
            "week_number",
        ]
    )

    dataframe["year"] = (
        dataframe["year"]
        .astype(int)
    )

    dataframe["week_number"] = (
        dataframe["week_number"]
        .astype(int)
    )

    # --------------------------------------------------------
    # Keep valid risk levels
    # --------------------------------------------------------

    valid_risks = [
        "CRITICAL",
        "HIGH",
        "MEDIUM",
        "LOW",
    ]

    dataframe = dataframe[
        dataframe["risk_level"].isin(
            valid_risks
        )
    ]

    # --------------------------------------------------------
    # Weekly aggregation
    # --------------------------------------------------------

    grouped = (
        dataframe
        .groupby(
            [
                "year",
                "week_number",
            ],
            as_index=False,
        )
        .agg(
            high=(
                "risk_level",
                lambda values:
                    int(
                        (
                            values == "HIGH"
                        ).sum()
                    ),
            ),

            medium=(
                "risk_level",
                lambda values:
                    int(
                        (
                            values == "MEDIUM"
                        ).sum()
                    ),
            ),

            low=(
                "risk_level",
                lambda values:
                    int(
                        (
                            values == "LOW"
                        ).sum()
                    ),
            ),

            critical=(
                "risk_level",
                lambda values:
                    int(
                        (
                            values == "CRITICAL"
                        ).sum()
                    ),
            ),
        )
    )

    # --------------------------------------------------------
    # Sort chronologically
    # --------------------------------------------------------

    grouped = grouped.sort_values(
        [
            "year",
            "week_number",
        ]
    )

    # --------------------------------------------------------
    # Keep latest requested weeks
    # --------------------------------------------------------

    grouped = grouped.tail(
        weeks
    )

    # --------------------------------------------------------
    # Build frontend-friendly response
    # --------------------------------------------------------

    trend = []

    for _, row in grouped.iterrows():

        year = int(
            row["year"]
        )

        week = int(
            row["week_number"]
        )

        trend.append(
            {
                "name": (
                    f"{year}-W"
                    f"{week:02d}"
                ),

                "year": year,

                "week_number": week,

                "high": int(
                    row["high"]
                ),

                "medium": int(
                    row["medium"]
                ),

                "low": int(
                    row["low"]
                ),

                "critical": int(
                    row["critical"]
                ),
            }
        )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "success": True,

        "message": (
            "Historical dashboard "
            "risk trend retrieved successfully"
        ),

        "weeks_requested": weeks,

        "weeks_returned": len(
            trend
        ),

        "data": trend,
    }
@router.get("/predictions")
def get_predictions():

    district_data = (
        build_district_summary()
    )

    return {
        "success": True,
        "data": district_data,
        "count": len(
            district_data
        ),
    }