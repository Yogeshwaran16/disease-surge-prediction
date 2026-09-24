from app.database.connection import (
    Base,
    SessionLocal,
    engine,
)

from app.models.recommendation import Recommendation

from app.repositories.recommendation_repository import (
    RecommendationRepository,
)


Base.metadata.create_all(
    bind=engine,
)


def test_create_recommendation():

    db = SessionLocal()

    try:

        repository = (
            RecommendationRepository(
                db
            )
        )


        record = repository.create(

            prediction_id="test-pred-001",

            district="Chennai",

            disease="dengue",

            risk_level="HIGH",

            outbreak_probability=0.90,

            confidence=0.85,

            recommendation_result={
                "recommendations": [
                    {
                        "action":
                            "Increase fogging operations"
                    }
                ]
            },

            emergency_escalation={
                "emergency_escalated":
                    False
            },

            emergency_response=None,
        )


        assert record.id is not None

        assert (
            record.prediction_id
            == "test-pred-001"
        )

        assert (
            record.district
            == "Chennai"
        )

    finally:

        db.close()