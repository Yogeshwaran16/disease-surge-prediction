"""
Explanation Service
===================

Service layer for generating human-readable explanations
for disease outbreak predictions.
"""

from typing import Any, Dict, List, Optional

import pandas as pd

from app.explainability.narrative_generator import NarrativeGenerator
from app.explainability.shap_explainer import SHAPExplainer
from app.models.explanation import Explanation, FeatureExplanation


class ExplanationService:
    """
    Coordinates SHAP explanation generation and
    human-readable narrative creation.
    """

    def __init__(
        self,
        model: Any,
        feature_names: Optional[List[str]] = None,
    ):
        self.model = model
        self.feature_names = feature_names

        self.shap_explainer = SHAPExplainer(
            model=model,
            feature_names=feature_names,
        )

        self.narrative_generator = NarrativeGenerator()

    def generate_explanation(
        self,
        features: Dict[str, Any],
        risk_level: str,
        prediction_id: Optional[str] = None,
    ) -> Explanation:
        """
        Generate a complete explanation for a prediction.

        Parameters
        ----------
        features:
            Input features used by the prediction model.

        risk_level:
            Predicted disease risk level.

        prediction_id:
            Optional identifier of the prediction.
        """

        # Convert input features to DataFrame
        input_data = pd.DataFrame(
            [features]
        )

        # Generate SHAP explanation
        shap_result = self.shap_explainer.explain(
            input_data
        )

        # Get explanation for first prediction row
        feature_explanations = (
            shap_result["explanations"][0]
        )

        # Generate human-readable narrative
        narrative = self.narrative_generator.generate(
            explanations=feature_explanations,
            risk_level=risk_level,
        )

        # Convert key factors to FeatureExplanation models
        key_factors = [
            FeatureExplanation(**factor)
            for factor in narrative["key_factors"]
        ]

        # Build final explanation
        return Explanation(
            prediction_id=prediction_id,
            risk_level=narrative["risk_level"],
            summary=narrative["summary"],
            positive_factors=narrative[
                "positive_factors"
            ],
            negative_factors=narrative[
                "negative_factors"
            ],
            key_factors=key_factors,
            metadata={
                "feature_count": len(features),
                "explainer": "SHAP",
            },
        )

    def get_feature_importance(
        self,
        features: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Get SHAP feature importance for the given input.
        """

        input_data = pd.DataFrame(
            [features]
        )

        return self.shap_explainer.get_feature_importance(
            input_data
        )