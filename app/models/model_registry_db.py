from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class ModelRegistryRecord(Base):

    __tablename__ = "model_registry"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    model_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    algorithm: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    metrics: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    training_records: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    dataset_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    model_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
