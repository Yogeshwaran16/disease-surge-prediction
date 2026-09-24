"""
Recommendation Agent
====================

Main AI agent for generating prioritized
disease outbreak recommendations.

Pipeline:

Action Matrix
      ↓
Rule Engine
      ↓
Priority Engine
      ↓
Final Recommendation Result
"""


from app.recommendations.rule_engine import (
    RuleEngine,
)

from app.recommendations.priority_engine import (
    PriorityEngine,
)


class RecommendationAgent:
    """
    Generates prioritized operational
    recommendations for disease outbreaks.
    """

    def __init__(self):

        self.rule_engine = RuleEngine()

        self.priority_engine = PriorityEngine()


    def generate_recommendations(
        self,
        risk_level: str,
        disease: str,
        outbreak_probability: float,
        confidence: float,
        driving_factors: list | None = None,
        feedback_weights: dict | None = None,
    ) -> dict:
        """
        Generate complete prioritized
        recommendation result.
        """


        # ============================================
        # VALIDATE VALUES
        # ============================================

        normalized_risk = (
            risk_level
            .strip()
            .upper()
        )

        normalized_disease = (
            disease
            .strip()
        )

        if not normalized_disease:

            raise ValueError(
                "Disease cannot be empty"
            )


        if not 0 <= outbreak_probability <= 1:

            raise ValueError(
                "Outbreak probability must be between 0 and 1"
            )


        if not 0 <= confidence <= 1:

            raise ValueError(
                "Confidence must be between 0 and 1"
            )


        # ============================================
        # GENERATE BASE ACTIONS
        # ============================================

        base_recommendations = (
            self.rule_engine.generate_recommendations(

                risk_level=normalized_risk,

                disease=normalized_disease,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

            )
        )


        # ============================================
        # PRIORITIZE ACTIONS
        # ============================================

        prioritized_recommendations = (
            self.priority_engine.prioritize(

                recommendations=
                    base_recommendations,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

                feedback_weights=
                    feedback_weights,

            )
        )


        # ============================================
        # GROUP BY CATEGORY
        # ============================================

        by_category = {}


        for recommendation in prioritized_recommendations:

            category = recommendation[
                "category"
            ]


            if category not in by_category:

                by_category[
                    category
                ] = []


            by_category[
                category
            ].append(
                recommendation
            )


        # ============================================
        # FINAL RESULT
        # ============================================

        result = {

            "risk_level":
                normalized_risk,

            "disease":
                normalized_disease,

            "outbreak_probability":
                outbreak_probability,

            "confidence":
                confidence,

            "driving_factors":
                driving_factors or [],

            "total_recommendations":
                len(
                    prioritized_recommendations
                ),

            "recommendations":
                prioritized_recommendations,

            "by_category":
                by_category,

        }


        return result