from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.connection import Base


class AgentHealth(Base):
    __tablename__ = "agent_health"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="unknown")
    last_run_at = Column(DateTime, nullable=True)
    last_success_at = Column(DateTime, nullable=True)
    last_failure_at = Column(DateTime, nullable=True)
    failure_count = Column(Integer, nullable=False, default=0)
    last_error = Column(Text, nullable=True)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
