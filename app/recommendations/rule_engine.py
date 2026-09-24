"""
Recommendation Rule Engine
==========================

Processes risk level and outbreak information
to generate operational recommendations.
"""

from app.recommendations.action_matrix import (
    get_actions_for_risk,
)


class RuleEngine:
    """
    Rule-based recommendation engine.
    """

    def generate_actions(
        self,
        risk_level: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
    ) -> list[dict]:
        """
        Generate actions based on risk level.
        """

        actions = get_actions_for_risk(
            risk_level
        )

        recommendations = []

        for action in actions:

            recommendation = {
                "disease": disease,
                "category": action["category"],
                "action": action["action"],
                "base_priority": action["priority"],
                "outbreak_probability": outbreak_probability,
                "confidence": confidence,
                "source": "risk_matrix",
            }

            recommendations.append(
                recommendation
            )

        return recommendations


    def generate_recommendations(
        self,
        risk_level: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
    ) -> list[dict]:
        """
        Alias method for generating
        recommendation actions.
        """

        return self.generate_actions(
            risk_level=risk_level,
            disease=disease,
            outbreak_probability=outbreak_probability,
            confidence=confidence,
        )