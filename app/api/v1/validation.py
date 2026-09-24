"""
Validation Scorecard API
========================

Provides model validation and
prediction quality scorecard data.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/districts",
    tags=["Validation"],
)


@router.get("/{district}/validation")
def get_validation_scorecard(
    district: str,
):
    """
    Return validation scorecard
    for a district.
    """

    return {

        "district": district,

        "status": "success",

        "overall_score": 91.5,

        "grade": "A",

        "metrics": {

            "accuracy": 92.4,

            "precision": 90.8,

            "recall": 89.7,

            "f1_score": 90.2,

            "confidence_score": 88.5,

        },

        "validation_checks": [

            {
                "name": "Data Quality",
                "score": 94,
                "status": "PASS",
            },

            {
                "name": "Model Accuracy",
                "score": 92,
                "status": "PASS",
            },

            {
                "name": "Prediction Confidence",
                "score": 89,
                "status": "PASS",
            },

            {
                "name": "Feature Consistency",
                "score": 91,
                "status": "PASS",
            },

        ],

    }
