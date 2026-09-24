"""
Recommendation Repository
=========================

Handles database operations for
recommendation records.
"""

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation


class RecommendationRepository:
    """
    Repository for recommendation database operations.
    """

    def __init__(
        self,
        db: Session,
    ):

        self.db = db


    def create(
        self,
        prediction_id: str,
        district: str,
        disease: str,
        risk_level: str,
        outbreak_probability: float,
        confidence: float,
        recommendation_result: dict,
        emergency_escalation: dict,
        emergency_response: dict | None,
    ) -> Recommendation:
        """
        Create and store a recommendation record.
        """

        recommendations_list = (
            recommendation_result.get(
                "recommendations",
                []
            )
        )


        record = Recommendation(

            prediction_id=prediction_id,

            district=district,

            disease=disease,

            risk_level=risk_level,

            outbreak_probability=outbreak_probability,

            confidence=confidence,

            total_recommendations=len(
                recommendations_list
            ),

            recommendations=recommendation_result,

            emergency_escalated=
                emergency_escalation.get(
                    "emergency_escalated",
                    False,
                ),

            emergency_response=
                emergency_response,

        )


        self.db.add(
            record
        )

        self.db.commit()

        self.db.refresh(
            record
        )


        return record


    def get_by_prediction_id(
        self,
        prediction_id: str,
    ) -> Recommendation | None:
        """
        Get recommendation using prediction ID.
        """

        return (
            self.db.query(
                Recommendation
            )
            .filter(
                Recommendation.prediction_id
                == prediction_id
            )
            .first()
        )


    def get_all(
        self,
        limit: int = 100,
    ) -> list[Recommendation]:
        """
        Get recent recommendation records.
        """

        return (
            self.db.query(
                Recommendation
            )
            .order_by(
                Recommendation.created_at.desc()
            )
            .limit(
                limit
            )
            .all()
        )