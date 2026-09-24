"""
Recommendation API Schemas
==========================
"""

from typing import Any

from pydantic import BaseModel, Field


class DrivingFactor(BaseModel):
    """
    SHAP driving factor for recommendation generation.
    """

    feature: str

    shap_value: float | None = None


class RecommendationRequest(BaseModel):
    """
    Request schema for recommendation generation.
    """

    district: str = Field(
        ...,
        min_length=2,
        examples=["Chennai"],
    )

    disease: str = Field(
        ...,
        min_length=2,
        examples=["dengue"],
    )

    risk_level: str = Field(
        ...,
        examples=["HIGH"],
    )

    outbreak_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        examples=[0.90],
    )

    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        examples=[0.85],
    )

    driving_factors: list[DrivingFactor] = Field(
        default_factory=list,
    )


class RecommendationResponse(BaseModel):
    """
    Response schema for recommendation API.
    """

    prediction_id: str

    district: str

    disease: str

    recommendation_result: dict[str, Any]

    emergency_escalation: dict[str, Any]

    emergency_response: dict[str, Any]