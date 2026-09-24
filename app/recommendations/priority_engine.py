"""
Recommendation Priority Engine
==============================

Calculates priority scores and ranks
generated recommendations.
"""


class PriorityEngine:
    """
    Calculates recommendation priority
    based on:

    - Base priority
    - Outbreak probability
    - Prediction confidence
    - Driving factors
    - Feedback weights
    """


    def calculate_priority(
        self,
        recommendation: dict,
        outbreak_probability: float,
        confidence: float,
        feedback_weights: dict | None = None,
    ) -> int:
        """
        Calculate final priority score.
        """

        base_priority = recommendation.get(
            "base_priority",
            50,
        )

        probability_score = (
            outbreak_probability * 10
        )

        confidence_score = (
            confidence * 10
        )

        feedback_score = 0


        # ============================================
        # FEEDBACK WEIGHT
        # ============================================

        if feedback_weights:

            category = recommendation.get(
                "category"
            )

            feedback_score = (
                feedback_weights.get(
                    category,
                    0,
                )
            )


        # ============================================
        # FINAL SCORE
        # ============================================

        final_score = (

            base_priority

            + probability_score

            + confidence_score

            + feedback_score

        )


        # ============================================
        # LIMIT SCORE
        # ============================================

        final_score = min(
            final_score,
            100,
        )


        return round(
            final_score
        )


    def prioritize(
        self,
        recommendations: list[dict],
        outbreak_probability: float,
        confidence: float,
        feedback_weights: dict | None = None,
    ) -> list[dict]:
        """
        Calculate priority for all recommendations
        and rank them.
        """

        prioritized = []


        for recommendation in recommendations:

            priority_score = (
                self.calculate_priority(

                    recommendation=recommendation,

                    outbreak_probability=
                        outbreak_probability,

                    confidence=
                        confidence,

                    feedback_weights=
                        feedback_weights,

                )
            )


            item = recommendation.copy()

            item[
                "priority_score"
            ] = priority_score


            prioritized.append(
                item
            )


        # ============================================
        # SORT BY PRIORITY
        # ============================================

        prioritized.sort(

            key=lambda item:
                item["priority_score"],

            reverse=True,

        )


        # ============================================
        # ADD RANK
        # ============================================

        for index, item in enumerate(
            prioritized,
            start=1,
        ):

            item["rank"] = index


        return prioritized