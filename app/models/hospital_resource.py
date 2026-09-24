"""
Hospital Resource Database Model
================================

Stores district-level health resource
availability for Resource Planning.
"""

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.database.connection import Base


class HospitalResource(Base):
    """
    Hospital resource database table.
    """

    __tablename__ = "hospital_resources"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    hospital_beds: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    ambulances: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    medical_staff: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    dengue_test_kits: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
