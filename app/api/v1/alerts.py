"""
District Alert API
==================

Generates district-level disease
risk alerts for health workers.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/districts",
    tags=["District Alerts"],
)


@router.get(
    "/{district}/alert"
)
def get_district_alert(
    district: str,
):
    """
    Generate alert information
    for a district.
    """

    return {

        "district": district,

        "status": "success",

        "alert_level": "HIGH",

        "disease": "Dengue",

        "message": (
            f"High Dengue outbreak risk detected "
            f"in {district}. Immediate preventive "
            f"action is recommended."
        ),

        "recommended_actions": [

            "Increase fever surveillance",

            "Conduct mosquito source reduction",

            "Deploy field health workers",

            "Increase public awareness",

        ],

    }