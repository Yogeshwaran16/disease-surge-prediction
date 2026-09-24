

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class FeatureExplanation(BaseModel):
    

    feature: str = Field(
        ...,
        description="Technical feature name",
    )

    label: str = Field(
        ...,
        description="Human-readable feature label",
    )

    description: str = Field(
        ...,
        description="Feature description",
    )

    category: str = Field(
        ...,
        description="Feature category",
    )

    shap_value: float = Field(
        ...,
        description="SHAP contribution value",
    )

    impact: str = Field(
        ...,
        description="Impact on disease risk",
    )


class Explanation(BaseModel):
   

    prediction_id: Optional[str] = Field(
        default=None,
        description="Associated prediction identifier",
    )

    risk_level: str = Field(
        ...,
        description="Predicted disease risk level",
    )

    summary: str = Field(
        ...,
        description="Human-readable explanation summary",
    )

    positive_factors: List[str] = Field(
        default_factory=list,
        description="Factors increasing risk",
    )

    negative_factors: List[str] = Field(
        default_factory=list,
        description="Factors decreasing risk",
    )

    key_factors: List[FeatureExplanation] = Field(
        default_factory=list,
        description="Most influential features",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Explanation creation timestamp",
    )

    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional explanation metadata",
    )