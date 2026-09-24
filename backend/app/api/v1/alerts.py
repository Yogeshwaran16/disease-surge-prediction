from fastapi import (
    APIRouter,
    HTTPException,
)

from pathlib import Path

import json


# ============================================
# ROUTER
# ============================================

router = APIRouter(
    prefix="/alerts",
    tags=[
        "Alerts"
    ],
)


# ============================================
# ALERT DATA PATH
# ============================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[3]
)

ALERT_FILE = (
    BASE_DIR /
    "data" /
    "alerts.json"
)


# ============================================
# LOAD ALERTS
# ============================================

def load_alerts():

    try:

        if not ALERT_FILE.exists():

            return []

        with open(
            ALERT_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            alerts = json.load(
                file
            )

        return alerts

    except Exception as error:

        print(
            "Alert Load Error:",
            error
        )

        return []


# ============================================
# HEALTH CHECK
# ============================================

@router.get(
    "/health"
)

def alert_health():

    return {

        "success": True,

        "service":
            "Alert Service",

        "status":
            "healthy",

    }


# ============================================
# GET ALL ALERTS
# ============================================

@router.get(
    "/"
)

def get_alerts():

    alerts = load_alerts()

    return {

        "success": True,

        "total":
            len(alerts),

        "data":
            alerts,

    }


# ============================================
# GET ALERT BY DISTRICT
# ============================================

@router.get(
    "/district/{district}"
)

def get_alert_by_district(
    district: str
):

    alerts = load_alerts()

    district_alerts = [

        alert

        for alert in alerts

        if (
            alert
            .get(
                "district",
                ""
            )
            .lower()

            ==

            district.lower()
        )

    ]

    if not district_alerts:

        raise HTTPException(

            status_code=404,

            detail=
                "No alerts found for this district",

        )

    return {

        "success": True,

        "district":
            district,

        "total":
            len(district_alerts),

        "data":
            district_alerts,

    }


# ============================================
# GET ALERTS BY RISK LEVEL
# ============================================

@router.get(
    "/risk/{risk_level}"
)

def get_alerts_by_risk(
    risk_level: str
):

    alerts = load_alerts()

    filtered_alerts = [

        alert

        for alert in alerts

        if (
            alert
            .get(
                "risk_level",
                ""
            )
            .upper()

            ==

            risk_level.upper()
        )

    ]

    return {

        "success": True,

        "risk_level":
            risk_level.upper(),

        "total":
            len(filtered_alerts),

        "data":
            filtered_alerts,

    }


# ============================================
# TEST ENDPOINT
# ============================================

@router.get(
    "/test"
)

def test_alerts():

    return {

        "success": True,

        "message":
            "Alert API is working",

    }