from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class RetrainingHistoryRecord(Base):

    __tablename__ = "retraining_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trigger_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    trigger_details: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    model_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    candidate_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    dataset_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    training_records: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    metrics: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    promotion_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
    )

    notes: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
