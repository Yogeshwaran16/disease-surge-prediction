from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agent_monitoring.service import get_agent_health
from app.database.connection import get_db
from app.celery_app.tasks.agent_tasks import AGENT_NAMES


router = APIRouter(
    prefix="/agents",
    tags=["Agent Monitoring"],
)


@router.get("/health")
def agent_health(db: Session = Depends(get_db)):
    records = get_agent_health(db)

    record_map = {
        record.agent_name: record
        for record in records
    }

    agents = []

    for agent_name in AGENT_NAMES:
        record = record_map.get(agent_name)

        if record is None:
            agents.append({
                "id": None,
                "agent_name": agent_name,
                "status": "unknown",
                "last_run_at": None,
                "last_success_at": None,
                "last_failure_at": None,
                "failure_count": 0,
                "last_error": None,
                "updated_at": None,
            })
        else:
            agents.append({
                "id": record.id,
                "agent_name": record.agent_name,
                "status": record.status,
                "last_run_at": record.last_run_at,
                "last_success_at": record.last_success_at,
                "last_failure_at": record.last_failure_at,
                "failure_count": record.failure_count,
                "last_error": record.last_error,
                "updated_at": record.updated_at,
            })

    return {
        "status": "success",
        "total_agents": len(agents),
        "agents": agents,
    }