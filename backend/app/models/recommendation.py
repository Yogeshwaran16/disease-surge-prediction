from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database.connection import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    district = Column(
        String,
        nullable=False,
        index=True,
    )

    disease = Column(
        String,
        nullable=False,
        index=True,
    )

    risk_level = Column(
        String,
        nullable=False,
    )

    priority = Column(
        String,
        nullable=False,
        default="MEDIUM",
    )

    recommendation = Column(
        Text,
        nullable=False,
    )

    action = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="PENDING",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )