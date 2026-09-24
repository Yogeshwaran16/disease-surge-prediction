"""
Data Source Citation API
========================

Provides provenance, freshness, and historical/current
dataset values for TECHNOVA Sentinel AI data sources.
"""

import csv
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/data-sources",
    tags=["Data Sources"],
)


# ============================================================
# DATA DIRECTORY
# ============================================================

DATA_DIR = Path(__file__).resolve().parents[3] / "data"


# ============================================================
# DATA SOURCE REGISTRY
# ============================================================

DATA_SOURCE_REGISTRY = [
    {
        "data_category": "Rainfall",
        "provider": "India Meteorological Department",
        "source_type": "Weather Data",
        "category": "Government",
        "ingestion_cadence": "Daily",
        "filename": "TamilNadu_IMD_Rainfall_2015_2025.csv",
        "date_column": "date",
        "value_column": "rainfall_mm",
        "value_unit": "mm",
    },
    {
        "data_category": "OPD Counts",
        "provider": "Tamil Nadu Health Department",
        "source_type": "Health Surveillance",
        "category": "Government",
        "ingestion_cadence": "Daily",
        "filename": "PHC_OPD_DailyRegistration_2015_2025.csv",
        "date_column": "date",
        "value_column": "total_opd",
        "value_unit": "registrations",
    },
    {
        "data_category": "Temperature",
        "provider": "India Meteorological Department",
        "source_type": "Weather Data",
        "category": "Government",
        "ingestion_cadence": "Daily",
        "filename": "TamilNadu_IMD_MaxTemperature_2015_2025.csv",
        "date_column": "date",
        "value_column": "max_temperature_c",
        "value_unit": "°C",
    },
    {
        "data_category": "Ambulance Calls",
        "provider": "Tamil Nadu Health Department",
        "source_type": "Emergency Health Data",
        "category": "Government",
        "ingestion_cadence": "Daily",
        "filename": "EMRI_108_AmbulanceCalls_2015_2025.csv",
        "date_column": "date",
        "value_column": "total_calls",
        "value_unit": "calls",
    },
    {
        "data_category": "Medicine Demand",
        "provider": "Tamil Nadu Health Department",
        "source_type": "Medicine Demand Data",
        "category": "Government",
        "ingestion_cadence": "Weekly",
        "filename": "TNMSC_MedicineIndent_Weekly_2015_2025.csv",
        "date_column": "week_start_date",
        "value_column": "dengue_diagnostic_kits",
        "value_unit": "kits",
    },
]


# ============================================================
# READ HISTORICAL / CURRENT VALUES
# ============================================================

def get_dataset_values(source: dict) -> dict:

    file_path = DATA_DIR / source["filename"]

    if not file_path.exists():
        return {
            "historical": None,
            "current": None,
        }

    rows = []

    try:
        with file_path.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                date_value = (
                    row.get(source["date_column"])
                    or ""
                ).strip()

                value = (
                    row.get(source["value_column"])
                    or ""
                ).strip()

                if not date_value or not value:
                    continue

                try:
                    parsed_date = datetime.strptime(
                        date_value,
                        "%Y-%m-%d",
                    )
                    numeric_value = float(value)
                except ValueError:
                    continue

                rows.append(
                    {
                        "date": date_value,
                        "parsed_date": parsed_date,
                        "value": numeric_value,
                    }
                )

    except (OSError, UnicodeDecodeError):
        return {
            "historical": None,
            "current": None,
        }

    if not rows:
        return {
            "historical": None,
            "current": None,
        }

    rows.sort(
        key=lambda item: item["parsed_date"]
    )

    historical = rows[0]
    current = rows[-1]

    return {
        "historical": {
            "date": historical["date"],
            "value": historical["value"],
            "unit": source["value_unit"],
        },
        "current": {
            "date": current["date"],
            "value": current["value"],
            "unit": source["value_unit"],
        },
    }


# ============================================================
# DATASET METADATA
# ============================================================

def get_dataset_metadata(source: dict) -> dict:

    file_path = DATA_DIR / source["filename"]

    if not file_path.exists():

        return {
            **source,
            "status": "MISSING",
            "last_updated": None,
            "file_size_bytes": 0,
            "historical_available": False,
            "current_available": False,
            "historical_value": None,
            "current_value": None,
            "ingestion_record_id": None,
        }

    stat = file_path.stat()

    values = get_dataset_values(source)

    return {
        **source,
        "status": "ACTIVE",
        "last_updated": datetime.fromtimestamp(
            stat.st_mtime
        ).isoformat(),
        "file_size_bytes": stat.st_size,
        "historical_available": (
            values["historical"] is not None
        ),
        "current_available": (
            values["current"] is not None
        ),
        "historical_value": values["historical"],
        "current_value": values["current"],
        "ingestion_record_id": (
            f"FILE:{source['filename']}"
        ),
    }


# ============================================================
# ALL SOURCES
# ============================================================

@router.get("")
def get_data_sources():

    sources = [
        get_dataset_metadata(source)
        for source in DATA_SOURCE_REGISTRY
    ]

    return {
        "status": "success",
        "total_sources": len(sources),
        "sources": sources,
    }


# ============================================================
# CITATION PANEL API
# ============================================================

@router.get("/citations")
def get_data_source_citations():

    sources = [
        get_dataset_metadata(source)
        for source in DATA_SOURCE_REGISTRY
    ]

    return {
        "status": "success",
        "total_sources": len(sources),
        "sources": sources,
    }


# ============================================================
# SINGLE SOURCE
# ============================================================

@router.get("/{data_category}")
def get_data_source(data_category: str):

    normalized = (
        data_category
        .strip()
        .lower()
    )

    for source in DATA_SOURCE_REGISTRY:

        if (
            source["data_category"].lower()
            == normalized
        ):
            return {
                "status": "success",
                "data": get_dataset_metadata(source),
            }

    raise HTTPException(
        status_code=404,
        detail=(
            f"Data source not found: "
            f"{data_category}"
        ),
    )