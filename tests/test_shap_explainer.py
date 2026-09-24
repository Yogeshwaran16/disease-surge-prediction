"""
Tests for SHAP Explainer
========================

Tests SHAP-based explanations using a simple
RandomForest classification model.
"""

import pandas as pd

from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier

from app.explainability.shap_explainer import SHAPExplainer


def create_test_model():
    """
    Create and train a small test model.
    """

    X, y = make_classification(
        n_samples=100,
        n_features=4,
        n_informative=3,
        n_redundant=0,
        random_state=42,
    )

    feature_names = [
        "temperature",
        "humidity",
        "rainfall",
        "previous_cases",
    ]

    X_df = pd.DataFrame(
        X,
        columns=feature_names,
    )

    model = RandomForestClassifier(
        n_estimators=20,
        random_state=42,
    )

    model.fit(X_df, y)

    return model, X_df, feature_names


def test_shap_explanation():
    """
    Test SHAP explanation generation.
    """

    model, X_df, feature_names = create_test_model()

    explainer = SHAPExplainer(
        model=model,
        feature_names=feature_names,
    )

    result = explainer.explain(
        X_df.iloc[:1]
    )

    assert "feature_names" in result
    assert "explanations" in result

    assert result["feature_names"] == feature_names

    assert len(result["explanations"]) == 1

    assert len(
        result["explanations"][0]
    ) == 4


def test_feature_importance():
    """
    Test SHAP feature importance calculation.
    """

    model, X_df, feature_names = create_test_model()

    explainer = SHAPExplainer(
        model=model,
        feature_names=feature_names,
    )

    importance = explainer.get_feature_importance(
        X_df.iloc[:10]
    )

    assert len(importance) == 4

    assert "feature" in importance[0]

    assert "importance" in importance[0]

    # Ensure importance is sorted descending
    assert (
        importance[0]["importance"]
        >= importance[-1]["importance"]
    )