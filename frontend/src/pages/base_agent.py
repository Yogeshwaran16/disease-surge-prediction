from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict


class BaseAgent(ABC):
    """
    Base class for all Module 14 AI agents.
    """

    def __init__(self, name: str):
        self.name = name
        self.status = "initialized"
        self.last_run = None

    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main task.
        """
        raise NotImplementedError

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Standard execution wrapper for all agents.
        """
        start_time = datetime.utcnow()
        self.status = "running"

        try:
            result = await self.execute(context)

            self.status = "completed"
            self.last_run = datetime.utcnow()

            return {
                "agent": self.name,
                "status": "success",
                "started_at": start_time.isoformat(),
                "completed_at": self.last_run.isoformat(),
                "result": result,
            }

        except Exception as exc:
            self.status = "failed"
            self.last_run = datetime.utcnow()

            return {
                "agent": self.name,
                "status": "error",
                "started_at": start_time.isoformat(),
                "completed_at": self.last_run.isoformat(),
                "error": str(exc),
            }

    def get_status(self) -> Dict[str, Any]:
        """
        Return current agent status.
        """
        return {
            "agent": self.name,
            "status": self.status,
            "last_run": (
                self.last_run.isoformat()
                if self.last_run
                else None
            ),
        }