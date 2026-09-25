from app.recommendations.rule_engine import RuleEngine


def test_generate_actions_builds_recommendations(monkeypatch):
    engine = RuleEngine()

    mock_actions = [
        {
            "category": "Vector Control",
            "action": "Increase mosquito control",
            "priority": 1,
        },
        {
            "category": "Healthcare",
            "action": "Prepare hospital resources",
            "priority": 2,
        },
    ]

    monkeypatch.setattr(
        "app.recommendations.rule_engine.get_actions_for_risk",
        lambda risk_level: mock_actions,
    )

    result = engine.generate_actions(
        risk_level="HIGH",
        disease="Dengue",
        outbreak_probability=0.92,
        confidence=0.88,
    )

    assert len(result) == 2

    assert result[0]["disease"] == "Dengue"
    assert result[0]["category"] == "Vector Control"
    assert result[0]["action"] == "Increase mosquito control"
    assert result[0]["base_priority"] == 1
    assert result[0]["outbreak_probability"] == 0.92
    assert result[0]["confidence"] == 0.88
    assert result[0]["source"] == "risk_matrix"


def test_generate_actions_preserves_all_action_fields(monkeypatch):
    engine = RuleEngine()

    mock_actions = [
        {
            "category": "Monitoring",
            "action": "Increase surveillance",
            "priority": 3,
        }
    ]

    monkeypatch.setattr(
        "app.recommendations.rule_engine.get_actions_for_risk",
        lambda risk_level: mock_actions,
    )

    result = engine.generate_actions(
        risk_level="MEDIUM",
        disease="Malaria",
        outbreak_probability=0.65,
        confidence=0.72,
    )

    assert result == [
        {
            "disease": "Malaria",
            "category": "Monitoring",
            "action": "Increase surveillance",
            "base_priority": 3,
            "outbreak_probability": 0.65,
            "confidence": 0.72,
            "source": "risk_matrix",
        }
    ]


def test_generate_recommendations_is_alias(monkeypatch):
    engine = RuleEngine()

    mock_actions = [
        {
            "category": "Testing",
            "action": "Increase testing",
            "priority": 2,
        }
    ]

    monkeypatch.setattr(
        "app.recommendations.rule_engine.get_actions_for_risk",
        lambda risk_level: mock_actions,
    )

    result = engine.generate_recommendations(
        risk_level="LOW",
        disease="Influenza",
        outbreak_probability=0.30,
        confidence=0.75,
    )

    assert len(result) == 1
    assert result[0]["disease"] == "Influenza"
    assert result[0]["category"] == "Testing"
    assert result[0]["base_priority"] == 2


def test_empty_action_matrix_returns_empty_list(monkeypatch):
    engine = RuleEngine()

    monkeypatch.setattr(
        "app.recommendations.rule_engine.get_actions_for_risk",
        lambda risk_level: [],
    )

    result = engine.generate_actions(
        risk_level="LOW",
        disease="Chikungunya",
        outbreak_probability=0.10,
        confidence=0.60,
    )

    assert result == []
