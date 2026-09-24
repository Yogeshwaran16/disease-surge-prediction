"""
Tests for Narrative Generator
=============================

Tests human-readable explanation generation.
"""

from app.explainability.narrative_generator import (
    NarrativeGenerator,
)


def test_high_risk_narrative():
    """
    Test HIGH risk narrative generation.
    """

    generator = NarrativeGenerator()

    explanations = [
        {
            "feature": "humidity",
            "shap_value": 0.85,
            "impact": "positive",
        },
        {
            "feature": "previous_cases",
            "shap_value": 0.65,
            "impact": "positive",
        },
        {
            "feature": "rainfall",
            "shap_value": 0.45,
            "impact": "positive",
        },
        {
            "feature": "healthcare_access",
            "shap_value": -0.30,
            "impact": "negative",
        },
    ]

    result = generator.generate(
        explanations=explanations,
        risk_level="HIGH",
    )

    assert result["risk_level"] == "HIGH"

    assert "HIGH" in result["summary"]

    assert len(result["positive_factors"]) > 0

    assert len(result["key_factors"]) == 3


def test_low_risk_narrative():
    """
    Test LOW risk narrative generation.
    """

    generator = NarrativeGenerator()

    explanations = [
        {
            "feature": "humidity",
            "shap_value": -0.50,
            "impact": "negative",
        },
        {
            "feature": "rainfall",
            "shap_value": -0.40,
            "impact": "negative",
        },
        {
            "feature": "previous_cases",
            "shap_value": -0.30,
            "impact": "negative",
        },
    ]

    result = generator.generate(
        explanations=explanations,
        risk_level="LOW",
    )

    assert result["risk_level"] == "LOW"

    assert "LOW" in result["summary"]

    assert len(result["negative_factors"]) > 0


def test_empty_explanations():
    """
    Test behavior when no explanations are provided.
    """

    generator = NarrativeGenerator()

    result = generator.generate(
        explanations=[],
        risk_level="UNKNOWN",
    )

    assert result["risk_level"] == "UNKNOWN"

    assert result["key_factors"] == []

    assert (
        result["summary"]
        == "No significant factors were available for explanation."
    )


def test_feature_mapping_in_narrative():
    """
    Test that technical feature names are mapped
    to human-readable labels.
    """

    generator = NarrativeGenerator()

    explanations = [
        {
            "feature": "population_density",
            "shap_value": 0.80,
            "impact": "positive",
        },
    ]

    result = generator.generate(
        explanations=explanations,
        risk_level="HIGH",
        top_features=1,
    )

    key_factor = result["key_factors"][0]

    assert key_factor["label"] == "Population Density"

    assert key_factor["category"] == "Demographics"