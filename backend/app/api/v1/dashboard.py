from fastapi import (
    APIRouter,
)


router = APIRouter(
    prefix="/dashboard",
    tags=[
        "Dashboard",
    ],
)


# ============================================
# SAMPLE PREDICTION DATA
# ============================================

PREDICTION_DATA = [

    {
        "district": "Chennai",
        "disease": "Dengue",
        "surge_probability": 0.88,
        "expected_cases_2w": 150,
        "risk_level": "HIGH",
        "year": 2026,
        "week_number": 36,
    },

    {
        "district": "Coimbatore",
        "disease": "Dengue",
        "surge_probability": 0.72,
        "expected_cases_2w": 110,
        "risk_level": "HIGH",
        "year": 2026,
        "week_number": 36,
    },

    {
        "district": "Madurai",
        "disease": "Dengue",
        "surge_probability": 0.55,
        "expected_cases_2w": 75,
        "risk_level": "MEDIUM",
        "year": 2026,
        "week_number": 36,
    },

    {
        "district": "Salem",
        "disease": "Dengue",
        "surge_probability": 0.42,
        "expected_cases_2w": 55,
        "risk_level": "MEDIUM",
        "year": 2026,
        "week_number": 36,
    },

    {
        "district": "Trichy",
        "disease": "Dengue",
        "surge_probability": 0.25,
        "expected_cases_2w": 30,
        "risk_level": "LOW",
        "year": 2026,
        "week_number": 36,
    },

    {
        "district": "Tirunelveli",
        "disease": "Dengue",
        "surge_probability": 0.18,
        "expected_cases_2w": 20,
        "risk_level": "LOW",
        "year": 2026,
        "week_number": 36,
    },

]


# ============================================
# HEALTH
# ============================================

@router.get(
    "/health"
)

def dashboard_health():

    return {

        "success":
            True,

        "service":
            "Dashboard",

        "status":
            "healthy",

    }


# ============================================
# DASHBOARD SUMMARY
# ============================================

@router.get(
    "/summary"
)

def get_dashboard_summary():

    total_predictions = (
        len(
            PREDICTION_DATA
        )
    )


    high_risk_count = sum(

        1

        for item in PREDICTION_DATA

        if (
            item[
                "risk_level"
            ]
            ==
            "HIGH"
        )

    )


    medium_risk_count = sum(

        1

        for item in PREDICTION_DATA

        if (
            item[
                "risk_level"
            ]
            ==
            "MEDIUM"
        )

    )


    low_risk_count = sum(

        1

        for item in PREDICTION_DATA

        if (
            item[
                "risk_level"
            ]
            ==
            "LOW"
        )

    )


    return {

        "success":
            True,

        "message":
            "Dashboard summary retrieved successfully",

        "total_predictions":
            total_predictions,

        "high_risk":
            high_risk_count,

        "medium_risk":
            medium_risk_count,

        "low_risk":
            low_risk_count,

        "all_districts":
            PREDICTION_DATA,

    }


# ============================================
# DASHBOARD ALERTS
# ============================================

@router.get(
    "/alerts"
)

def get_dashboard_alerts():

    alerts = [

        item

        for item in PREDICTION_DATA

        if (

            item[
                "risk_level"
            ]

            in [

                "HIGH",

                "CRITICAL",

            ]

        )

    ]


    return {

        "success":
            True,

        "data":
            alerts,

    }