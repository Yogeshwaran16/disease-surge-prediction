from fastapi import (
    APIRouter,
    HTTPException,
)

from pydantic import BaseModel

from typing import (
    Optional,
    List,
)


router = APIRouter(
    prefix="/recommendations",
    tags=[
        "Recommendations"
    ],
)


# ============================================
# REQUEST SCHEMA
# ============================================

class RecommendationRequest(
    BaseModel
):

    district: str

    disease: str = "Dengue"

    risk_level: str

    surge_probability: float

    confidence_score: float = 0.0

    expected_cases_2w: int = 0


# ============================================
# RESPONSE GENERATOR
# ============================================

def generate_recommendations(
    data: RecommendationRequest
):

    risk_level = (
        data.risk_level
        .upper()
        .strip()
    )


    recommendations = []


    # ========================================
    # CRITICAL RISK
    # ========================================

    if risk_level == "CRITICAL":

        recommendations = [

            {
                "category":
                    "Vector Control",

                "action":
                    "Immediate fogging and larval source reduction",

                "priority":
                    "CRITICAL",

                "timeline":
                    "Within 24 hours",
            },

            {
                "category":
                    "Hospital Preparedness",

                "action":
                    "Activate emergency beds and surge capacity",

                "priority":
                    "CRITICAL",

                "timeline":
                    "Immediate",
            },

            {
                "category":
                    "Medicine Allocation",

                "action":
                    "Deploy emergency medicine and IV fluid stock",

                "priority":
                    "CRITICAL",

                "timeline":
                    "Within 24 hours",
            },

            {
                "category":
                    "Health Worker Deployment",

                "action":
                    "Deploy additional ASHA and field health workers",

                "priority":
                    "HIGH",

                "timeline":
                    "Within 24 hours",
            },

            {
                "category":
                    "Public Awareness",

                "action":
                    "Launch emergency disease prevention campaign",

                "priority":
                    "HIGH",

                "timeline":
                    "Immediate",
            },

        ]


    # ========================================
    # HIGH RISK
    # ========================================

    elif risk_level == "HIGH":

        recommendations = [

            {
                "category":
                    "Vector Control",

                "action":
                    "Increase fogging and mosquito control activities",

                "priority":
                    "HIGH",

                "timeline":
                    "Within 48 hours",
            },

            {
                "category":
                    "Hospital Preparedness",

                "action":
                    "Prepare additional beds and monitor admissions",

                "priority":
                    "HIGH",

                "timeline":
                    "Within 48 hours",
            },

            {
                "category":
                    "Medicine Allocation",

                "action":
                    "Increase medicine and diagnostic kit availability",

                "priority":
                    "HIGH",

                "timeline":
                    "Within 48 hours",
            },

            {
                "category":
                    "Health Worker Deployment",

                "action":
                    "Increase surveillance and field visits",

                "priority":
                    "MEDIUM",

                "timeline":
                    "Within 72 hours",
            },

        ]


    # ========================================
    # MEDIUM RISK
    # ========================================

    elif risk_level == "MEDIUM":

        recommendations = [

            {
                "category":
                    "Vector Control",

                "action":
                    "Conduct targeted vector surveillance",

                "priority":
                    "MEDIUM",

                "timeline":
                    "Within 7 days",
            },

            {
                "category":
                    "Hospital Preparedness",

                "action":
                    "Review hospital preparedness",

                "priority":
                    "MEDIUM",

                "timeline":
                    "Within 7 days",
            },

            {
                "category":
                    "Public Awareness",

                "action":
                    "Increase community awareness activities",

                "priority":
                    "MEDIUM",

                "timeline":
                    "Within 7 days",
            },

        ]


    # ========================================
    # LOW RISK
    # ========================================

    else:

        recommendations = [

            {
                "category":
                    "Monitoring",

                "action":
                    "Continue routine disease surveillance",

                "priority":
                    "LOW",

                "timeline":
                    "Routine",
            },

            {
                "category":
                    "Public Awareness",

                "action":
                    "Maintain regular prevention awareness",

                "priority":
                    "LOW",

                "timeline":
                    "Routine",
            },

        ]


    # ========================================
    # EMERGENCY ESCALATION
    # ========================================

    emergency_escalation = False


    if (

        data.surge_probability >= 0.85

        and

        data.confidence_score >= 0.80

    ):

        emergency_escalation = True


    return {

        "district":
            data.district,

        "disease":
            data.disease,

        "risk_level":
            risk_level,

        "surge_probability":
            data.surge_probability,

        "confidence_score":
            data.confidence_score,

        "expected_cases_2w":
            data.expected_cases_2w,

        "emergency_escalation":
            emergency_escalation,

        "recommendations":
            recommendations,

    }


# ============================================
# GET API
# ============================================

@router.get(
    "/health"
)

def recommendation_health():

    return {

        "success": True,

        "service":
            "Recommendation Engine",

        "status":
            "healthy",

    }


# ============================================
# GENERATE RECOMMENDATIONS
# ============================================

@router.post(
    "/generate"
)

def create_recommendations(
    data: RecommendationRequest
):

    try:

        result = (
            generate_recommendations(
                data
            )
        )


        return {

            "success": True,

            "message":
                "Recommendations generated successfully",

            "data":
                result,

        }


    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=str(error),

        )


# ============================================
# TEST ENDPOINT
# ============================================

@router.get(
    "/test"
)

def test_recommendations():

    return {

        "success": True,

        "message":
            "Recommendation API is working",

    }