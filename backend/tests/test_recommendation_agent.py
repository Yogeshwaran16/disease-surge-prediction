import pytest

from app.agents.recommendation_agent import RecommendationAgent


def test_generate_recommendations_success(monkeypatch):
    agent = RecommendationAgent()

    base = [
        {
            "category": "Vector Control",
            "action": "Increase mosquito control",
        },
        {
            "category": "Healthcare",
            "action": "Prepare hospital capacity",
        },
    ]

    prioritized = [
        {
            "category": "Healthcare",
            "action": "Prepare hospital capacity",
            "priority": 1,
        },
        {
            "category": "Vector Control",
            "action": "Increase mosquito control",
            "priority": 2,
        },
    ]

    monkeypatch.setattr(
        agent.rule_engine,
        "generate_recommendations",
        lambda **kwargs: base,
    )

    monkeypatch.setattr(
        agent.priority_engine,
        "prioritize",
        lambda **kwargs: prioritized,
    )

    result = agent.generate_recommendations(
        risk_level=" high ",
        disease="Dengue",
        outbreak_probability=0.91,
        confidence=0.87,
        driving_factors=["Rainfall", "Previous cases"],
    )

    assert result["risk_level"] == "HIGH"
    assert result["disease"] == "Dengue"
    assert result["outbreak_probability"] == 0.91
    assert result["confidence"] == 0.87
    assert result["driving_factors"] == [
        "Rainfall",
        "Previous cases",
    ]
    assert result["total_recommendations"] == 2
    assert result["recommendations"] == prioritized
    assert "Healthcare" in result["by_category"]
    assert "Vector Control" in result["by_category"]


def test_empty_disease_rejected():
    agent = RecommendationAgent()

    with pytest.raises(ValueError, match="Disease cannot be empty"):
        agent.generate_recommendations(
            risk_level="HIGH",
            disease="   ",
            outbreak_probability=0.8,
            confidence=0.8,
        )


@pytest.mark.parametrize(
    "probability",
    [-0.01, 1.01],
)
def test_invalid_outbreak_probability_rejected(probability):
    agent = RecommendationAgent()

    with pytest.raises(
        ValueError,
        match="Outbreak probability must be between 0 and 1",
    ):
        agent.generate_recommendations(
            risk_level="HIGH",
            disease="Dengue",
            outbreak_probability=probability,
            confidence=0.8,
        )


@pytest.mark.parametrize(
    "confidence",
    [-0.01, 1.01],
)
def test_invalid_confidence_rejected(confidence):
    agent = RecommendationAgent()

    with pytest.raises(
        ValueError,
        match="Confidence must be between 0 and 1",
    ):
        agent.generate_recommendations(
            risk_level="HIGH",
            disease="Dengue",
            outbreak_probability=0.8,
            confidence=confidence,
        )
