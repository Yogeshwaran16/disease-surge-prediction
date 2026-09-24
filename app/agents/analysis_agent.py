
from typing import Any, Dict, List, Optional

from app.services.explanation_service import ExplanationService


class AnalysisAgent:
    

    def __init__(
        self,
        model: Any,
        feature_names: Optional[List[str]] = None,
    ):
        self.explanation_service = ExplanationService(
            model=model,
            feature_names=feature_names,
        )

    def analyze_prediction(
        self,
        features: Dict[str, Any],
        risk_level: str,
        prediction_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a disease prediction and generate a complete
        explainability report.
        """

        explanation = (
            self.explanation_service.generate_explanation(
                features=features,
                risk_level=risk_level,
                prediction_id=prediction_id,
            )
        )

        feature_importance = (
            self.explanation_service.get_feature_importance(
                features=features,
            )
        )

        return {
            "prediction_id": explanation.prediction_id,
            "risk_level": explanation.risk_level,
            "summary": explanation.summary,
            "positive_factors": explanation.positive_factors,
            "negative_factors": explanation.negative_factors,
            "key_factors": [
                factor.model_dump()
                for factor in explanation.key_factors
            ],
            "feature_importance": feature_importance,
            "metadata": explanation.metadata,
        }

    def get_quick_analysis(
        self,
        features: Dict[str, Any],
        risk_level: str,
    ) -> Dict[str, Any]:
        """
        Generate a lightweight analysis without
        additional feature importance processing.
        """

        explanation = (
            self.explanation_service.generate_explanation(
                features=features,
                risk_level=risk_level,
            )
        )

        return {
            "risk_level": explanation.risk_level,
            "summary": explanation.summary,
            "key_factors": [
                factor.model_dump()
                for factor in explanation.key_factors
            ],
        }