"""
Explanation Schemas
===================

Pydantic schemas for explanation API requests and responses.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ExplainPredictionRequest(BaseModel):
    """
    Request schema for generating a prediction explanation.
    """

    prediction_id: Optional[str] = Field(
        default=None,
        description="Prediction identifier",
    )

    risk_level: str = Field(
        ...,
        description="Predicted disease risk level",
        examples=["HIGH"],
    )

    features: Dict[str, Any] = Field(
        ...,
        description="Input features used for prediction",
    )


class FeatureExplanationResponse(BaseModel):
    """
    Response schema for a single feature explanation.
    """

    feature: str
    label: str
    description: str
    category: str
    shap_value: float
    impact: str


class ExplanationResponse(BaseModel):
    """
    Response schema for a complete prediction explanation.
    """

    prediction_id: Optional[str] = None

    risk_level: str

    summary: str

    positive_factors: List[str] = Field(
        default_factory=list,
    )

    negative_factors: List[str] = Field(
        default_factory=list,
    )

    key_factors: List[
        FeatureExplanationResponse
    ] = Field(
        default_factory=list,
    )

    metadata: Dict[str, Any] = Field(
        default_factory=dict,
    )


class ExplanationListResponse(BaseModel):
    """
    Response schema for multiple explanations.
    """

    explanations: List[ExplanationResponse]

    total: int