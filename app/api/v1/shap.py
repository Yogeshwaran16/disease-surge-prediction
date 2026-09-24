"""
SHAP Feature Breakdown API
==========================

Provides feature importance and
SHAP-style explanation data
for district disease predictions.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/districts",
    tags=["SHAP Analysis"],
)


@router.get(
    "/{district}/shap"
)
def get_district_shap(
    district: str,
):
    """
    Return SHAP feature importance
    breakdown for a district.
    """

    features = [

        {
            "feature": "Rainfall",
            "shap_value": 0.28,
            "impact": "POSITIVE",
            "description": (
                "Higher rainfall is increasing "
                "the outbreak risk."
            ),
        },

        {
            "feature": "Temperature",
            "shap_value": 0.21,
            "impact": "POSITIVE",
            "description": (
                "Current temperature conditions "
                "support disease transmission."
            ),
        },

        {
            "feature": "Humidity",
            "shap_value": 0.18,
            "impact": "POSITIVE",
            "description": (
                "High humidity is contributing "
                "to outbreak risk."
            ),
        },

        {
            "feature": "Previous Cases",
            "shap_value": 0.25,
            "impact": "POSITIVE",
            "description": (
                "Recent historical case trends "
                "increase predicted risk."
            ),
        },

        {
            "feature": "Population Density",
            "shap_value": 0.12,
            "impact": "POSITIVE",
            "description": (
                "Higher population density may "
                "increase disease transmission."
            ),
        },

        {
            "feature": "Healthcare Coverage",
            "shap_value": -0.14,
            "impact": "NEGATIVE",
            "description": (
                "Healthcare coverage is helping "
                "reduce outbreak risk."
            ),
        },

    ]


    return {

        "district": district,

        "status": "success",

        "total_features": len(
            features
        ),

        "features": features,

    }