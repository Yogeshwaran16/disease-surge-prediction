"""
Recommendation Service
======================

Main service layer for Module 7.

Pipeline:

Recommendation Agent
        ↓
Emergency Escalation Engine
        ↓
Emergency Response Service
        ↓
Database Repository
"""


from sqlalchemy.orm import Session


from app.agents.recommendation_agent import (
    RecommendationAgent,
)

from app.recommendations.emergency_escalation import (
    EmergencyEscalationEngine,
)

from app.recommendations.emergency_response import (
    EmergencyResponseService,
)

from app.repositories.recommendation_repository import (
    RecommendationRepository,
)


class RecommendationService:
    """
    Main Recommendation Service.

    Coordinates:

    - Recommendation generation
    - Emergency escalation
    - Emergency response
    - Database storage
    """


    def __init__(
        self,
        db: Session | None = None,
        escalation_engine: EmergencyEscalationEngine | None = None,
    ):

        # ============================================
        # RECOMMENDATION AGENT
        # ============================================

        self.agent = RecommendationAgent()


        # ============================================
        # EMERGENCY ESCALATION ENGINE
        # ============================================

        self.escalation_engine = (

            escalation_engine

            if escalation_engine is not None

            else EmergencyEscalationEngine()

        )


        # ============================================
        # EMERGENCY RESPONSE SERVICE
        # ============================================

        self.emergency_response_service = (
            EmergencyResponseService()
        )


        # ============================================
        # DATABASE REPOSITORY
        # ============================================

        self.repository = None


        if db is not None:

            self.repository = (
                RecommendationRepository(
                    db
                )
            )


    def generate(
        self,
        prediction_id: str,
        district: str,
        disease: str,
        risk_level: str,
        outbreak_probability: float,
        confidence: float,
        driving_factors: list | None = None,
        feedback_weights: dict | None = None,
    ) -> dict:
        """
        Generate complete recommendation result.
        """


        # ============================================
        # GENERATE RECOMMENDATIONS
        # ============================================

        recommendation_result = (

            self.agent.generate_recommendations(

                risk_level=risk_level,

                disease=disease,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

                driving_factors=
                    driving_factors,

                feedback_weights=
                    feedback_weights,

            )

        )


        # ============================================
        # CHECK EMERGENCY ESCALATION
        # ============================================

        escalation_result = (

            self.escalation_engine.evaluate(

                district=district,

                disease=disease,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

            )

        )


        # ============================================
        # GENERATE EMERGENCY RESPONSE
        # ============================================

        emergency_response = (

            self.emergency_response_service
            .generate_response(

                district=district,

                disease=disease,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

                escalation_result=
                    escalation_result,

            )

        )


        # ============================================
        # FINAL RESULT
        # ============================================

        result = {

            "prediction_id":
                prediction_id,

            "district":
                district,

            "disease":
                disease,

            "recommendation_result":
                recommendation_result,

            "emergency_escalation":
                escalation_result,

            "emergency_response":
                emergency_response,

        }


        # ============================================
        # SAVE TO DATABASE
        # ============================================

        if self.repository is not None:

            self.repository.create(

                prediction_id=
                    prediction_id,

                district=
                    district,

                disease=
                    disease,

                risk_level=
                    risk_level,

                outbreak_probability=
                    outbreak_probability,

                confidence=
                    confidence,

                recommendation_result=
                    recommendation_result,

                emergency_escalation=
                    escalation_result,

                emergency_response=
                    emergency_response,

            )


        return result