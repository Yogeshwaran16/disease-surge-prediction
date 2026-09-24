from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.connection import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    report_type = Column(String(50), nullable=False)
    output_format = Column(String(20), nullable=False)

    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    status = Column(String(30), nullable=False, default="generated")

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    metadata_json = Column(Text, nullable=True)
