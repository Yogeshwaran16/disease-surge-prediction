from datetime import datetime

from sqlalchemy.orm import Session

from app.agent_monitoring.models import AgentHealth


def record_agent_success(db: Session, agent_name: str) -> None:
    record = (
        db.query(AgentHealth)
        .filter(AgentHealth.agent_name == agent_name)
        .first()
    )

    if record is None:
        record = AgentHealth(
            agent_name=agent_name,
            status="healthy",
            last_run_at=datetime.utcnow(),
            last_success_at=datetime.utcnow(),
            failure_count=0,
        )
        db.add(record)
    else:
        now = datetime.utcnow()
        record.status = "healthy"
        record.last_run_at = now
        record.last_success_at = now
        record.last_error = None

    db.commit()


def record_agent_failure(
    db: Session,
    agent_name: str,
    error_message: str,
) -> None:
    record = (
        db.query(AgentHealth)
        .filter(AgentHealth.agent_name == agent_name)
        .first()
    )

    now = datetime.utcnow()

    if record is None:
        record = AgentHealth(
            agent_name=agent_name,
            status="failed",
            last_run_at=now,
            last_failure_at=now,
            failure_count=1,
            last_error=error_message,
        )
        db.add(record)
    else:
        record.status = "failed"
        record.last_run_at = now
        record.last_failure_at = now
        record.failure_count += 1
        record.last_error = error_message

    db.commit()


def get_agent_health(db: Session):
    return (
        db.query(AgentHealth)
        .order_by(AgentHealth.agent_name.asc())
        .all()
    )
