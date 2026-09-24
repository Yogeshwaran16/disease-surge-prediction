"""
Database Initialization
=======================
"""

from app.database.connection import (
    Base,
    engine,
)

from app.models.recommendation import (
    Recommendation,
)

from app.models.hospital_resource import (
    HospitalResource,
)

from app.models.model_registry_db import (
    ModelRegistryRecord,
)

from app.models.retraining_history_db import (
    RetrainingHistoryRecord,
)


def initialize_database():
    """
    Create all database tables.
    """

    Base.metadata.create_all(
        bind=engine,
    )

    print(
        "Database tables created successfully"
    )


if __name__ == "__main__":

    initialize_database()
