"""
Narrative Generator
===================

Converts SHAP feature explanations into human-readable
narratives for disease outbreak risk predictions.
"""

from typing import Any, Dict, List, Optional

from app.explainability.feature_mapper import FeatureMapper


class NarrativeGenerator:
    """
    Generates human-readable explanations from
    feature-level SHAP values.
    """

    def __init__(
        self,
        feature_mapper: Optional[FeatureMapper] = None,
    ):
        self.feature_mapper = (
            feature_mapper or FeatureMapper()
        )

    def generate(
        self,
        explanations: List[Dict[str, Any]],
        risk_level: str = "UNKNOWN",
        top_features: int = 3,
    ) -> Dict[str, Any]:
        """
        Generate a complete explanation narrative.

        Parameters
        ----------
        explanations:
            List of feature explanations containing
            feature, shap_value and impact.

        risk_level:
            Predicted disease risk level.

        top_features:
            Number of most important features to include.
        """

        if not explanations:
            return {
                "summary": "No significant factors were available for explanation.",
                "risk_level": risk_level,
                "positive_factors": [],
                "negative_factors": [],
                "key_factors": [],
            }

        # Sort features by absolute SHAP impact
        sorted_features = sorted(
            explanations,
            key=lambda item: abs(
                item.get("shap_value", 0)
            ),
            reverse=True,
        )

        top_items = sorted_features[:top_features]

        positive_factors = [
            item for item in sorted_features
            if item.get("shap_value", 0) > 0
        ]

        negative_factors = [
            item for item in sorted_features
            if item.get("shap_value", 0) < 0
        ]

        key_factors = [
            self._format_feature(item)
            for item in top_items
        ]

        positive_names = [
            self._get_label(item)
            for item in positive_factors[:top_features]
        ]

        negative_names = [
            self._get_label(item)
            for item in negative_factors[:top_features]
        ]

        summary = self._build_summary(
            risk_level=risk_level,
            positive_names=positive_names,
            negative_names=negative_names,
        )

        return {
            "summary": summary,
            "risk_level": risk_level,
            "positive_factors": positive_names,
            "negative_factors": negative_names,
            "key_factors": key_factors,
        }

    def _get_label(
        self,
        item: Dict[str, Any],
    ) -> str:
        """
        Get human-readable feature label.
        """

        feature_name = item.get("feature", "Unknown")

        return self.feature_mapper.get_label(
            feature_name
        )

    def _format_feature(
        self,
        item: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Format a feature for API response.
        """

        feature_name = item.get("feature", "Unknown")
        feature_info = self.feature_mapper.map_feature(
            feature_name
        )

        shap_value = float(
            item.get("shap_value", 0)
        )

        return {
            **feature_info,
            "shap_value": shap_value,
            "impact": (
                "increases_risk"
                if shap_value > 0
                else "decreases_risk"
                if shap_value < 0
                else "neutral"
            ),
        }

    def _build_summary(
        self,
        risk_level: str,
        positive_names: List[str],
        negative_names: List[str],
    ) -> str:
        """
        Build a human-readable explanation summary.
        """

        risk_level = risk_level.upper()

        if risk_level == "HIGH":

            if positive_names:
                factors = self._join_features(
                    positive_names
                )

                return (
                    f"The predicted disease risk is HIGH. "
                    f"The main factors increasing the risk are "
                    f"{factors}."
                )

            return (
                "The predicted disease risk is HIGH based on "
                "the combined influence of the available factors."
            )

        if risk_level == "MEDIUM":

            positive_text = (
                self._join_features(positive_names)
                if positive_names
                else "several contributing factors"
            )

            return (
                f"The predicted disease risk is MEDIUM. "
                f"The main contributing factors are "
                f"{positive_text}."
            )

        if risk_level == "LOW":

            if negative_names:
                factors = self._join_features(
                    negative_names
                )

                return (
                    f"The predicted disease risk is LOW. "
                    f"The main factors reducing the risk are "
                    f"{factors}."
                )

            return (
                "The predicted disease risk is LOW based on "
                "the combined influence of the available factors."
            )

        return (
            f"The predicted disease risk is {risk_level}. "
            "The explanation is based on the most influential "
            "input features."
        )

    @staticmethod
    def _join_features(
        features: List[str],
    ) -> str:
        """
        Convert a feature list into a readable sentence.
        """

        if not features:
            return ""

        if len(features) == 1:
            return features[0]

        if len(features) == 2:
            return f"{features[0]} and {features[1]}"

        return (
            ", ".join(features[:-1])
            + f", and {features[-1]}"
        )