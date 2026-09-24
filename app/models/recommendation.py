"""
Recommendation Database Model
=============================

Stores generated recommendations
for disease outbreak predictions.
"""

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    JSON,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.database.connection import Base


class Recommendation(Base):
    """
    Recommendation database table.
    """

    __tablename__ = "recommendations"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )


    prediction_id: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
    )


    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


    disease: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


    outbreak_probability: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )


    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )


    total_recommendations: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )


    recommendations: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )


    emergency_escalated: Mapped[bool] = mapped_column(
        default=False,
    )


    emergency_response: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )