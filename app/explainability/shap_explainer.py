"""
SHAP Explainability Engine
==========================

Generates feature-level explanations for disease outbreak predictions.
"""

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import shap


class SHAPExplainer:
    """
    Wrapper around SHAP for generating model explanations.

    Supports tree-based models and generic prediction models.
    """

    def __init__(
        self,
        model: Any,
        feature_names: Optional[List[str]] = None,
    ):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None

    def build_explainer(
        self,
        background_data: Optional[pd.DataFrame] = None,
    ) -> None:
        """
        Build the appropriate SHAP explainer.
        """

        try:

            # Tree models:
            # XGBoost, LightGBM, RandomForest, etc.
            self.explainer = shap.TreeExplainer(
                self.model
            )

        except Exception:

            if background_data is None:
                raise ValueError(
                    "background_data is required for non-tree models"
                )

            self.explainer = shap.Explainer(
                self.model,
                background_data,
            )

    def explain(
        self,
        input_data: pd.DataFrame,
    ) -> Dict[str, Any]:
        """
        Generate SHAP explanation for input data.

        Returns:
            Feature-level SHAP values and impact direction.
        """

        if self.explainer is None:
            self.build_explainer(input_data)

        shap_values = self.explainer(input_data)

        values = shap_values.values

        # Handle multi-class output
        if len(values.shape) == 3:
            values = values[:, :, -1]

        feature_names = (
            self.feature_names
            or list(input_data.columns)
        )

        explanations = []

        for row_index in range(len(input_data)):

            row_explanation = []

            for feature_index, feature_name in enumerate(
                feature_names
            ):

                value = float(
                    values[row_index][feature_index]
                )

                row_explanation.append(
                    {
                        "feature": feature_name,
                        "shap_value": value,
                        "impact": (
                            "positive"
                            if value > 0
                            else "negative"
                            if value < 0
                            else "neutral"
                        ),
                        "feature_value": self._safe_value(
                            input_data.iloc[
                                row_index,
                                feature_index,
                            ]
                        ),
                    }
                )

            explanations.append(
                row_explanation
            )

        return {
            "feature_names": feature_names,
            "explanations": explanations,
        }

    def get_top_features(
        self,
        input_data: pd.DataFrame,
        top_n: int = 5,
    ) -> List[List[Dict[str, Any]]]:
        """
        Return top-N contributing features for every prediction row.

        Features are ranked using absolute SHAP magnitude.
        """

        result = self.explain(input_data)

        top_features = []

        for row in result["explanations"]:

            ranked = sorted(
                row,
                key=lambda item: abs(
                    item["shap_value"]
                ),
                reverse=True,
            )

            top_features.append(
                ranked[:top_n]
            )

        return top_features

    def get_feature_importance(
        self,
        input_data: pd.DataFrame,
    ) -> List[Dict[str, Any]]:
        """
        Calculate mean absolute SHAP importance.
        """

        result = self.explain(input_data)

        importance_map = {}

        for row in result["explanations"]:

            for feature in row:

                name = feature["feature"]

                importance_map.setdefault(
                    name,
                    []
                )

                importance_map[name].append(
                    abs(
                        feature["shap_value"]
                    )
                )

        importance = []

        for name, values in importance_map.items():

            importance.append(
                {
                    "feature": name,
                    "importance": float(
                        np.mean(values)
                    ),
                }
            )

        return sorted(
            importance,
            key=lambda x: x["importance"],
            reverse=True,
        )

    def generate_narrative(
        self,
        top_features: List[Dict[str, Any]],
    ) -> str:
        """
        Generate a deterministic natural-language explanation
        from SHAP feature contributions.

        The narrative is based strictly on SHAP output.
        """

        if not top_features:
            return (
                "No significant contributing features "
                "were identified."
            )

        positive = [
            item
            for item in top_features
            if item["shap_value"] > 0
        ]

        negative = [
            item
            for item in top_features
            if item["shap_value"] < 0
        ]

        parts = []

        if positive:

            positive_text = ", ".join(
                item["feature"]
                for item in positive
            )

            parts.append(
                "Factors increasing the predicted "
                f"risk include {positive_text}."
            )

        if negative:

            negative_text = ", ".join(
                item["feature"]
                for item in negative
            )

            parts.append(
                "Factors decreasing the predicted "
                f"risk include {negative_text}."
            )

        if not parts:

            parts.append(
                "The leading features have neutral "
                "SHAP contributions."
            )

        return " ".join(parts)

    def explain_with_top_features(
        self,
        input_data: pd.DataFrame,
        top_n: int = 5,
    ) -> Dict[str, Any]:
        """
        Generate complete structured SHAP explanations.

        Includes:
        - all feature contributions
        - top-N features
        - feature importance
        - natural-language narrative
        """

        base_result = self.explain(
            input_data
        )

        top_features = self.get_top_features(
            input_data,
            top_n=top_n,
        )

        explanations = []

        for index, row in enumerate(
            base_result["explanations"]
        ):

            top = top_features[index]

            explanations.append(
                {
                    "row_index": index,
                    "top_features": top,
                    "narrative": self.generate_narrative(
                        top
                    ),
                    "all_features": row,
                }
            )

        return {
            "feature_names": base_result[
                "feature_names"
            ],
            "top_n": top_n,
            "explanations": explanations,
            "feature_importance": self.get_feature_importance(
                input_data
            ),
        }

    @staticmethod
    def _safe_value(
        value: Any,
    ) -> Any:
        """
        Convert NumPy/Pandas scalar values into
        JSON-safe Python values.
        """

        if pd.isna(value):
            return None

        if isinstance(
            value,
            np.integer,
        ):
            return int(value)

        if isinstance(
            value,
            np.floating,
        ):
            return float(value)

        if isinstance(
            value,
            np.bool_,
        ):
            return bool(value)

        return value