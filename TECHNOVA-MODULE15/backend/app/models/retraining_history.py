from datetime import datetime
from typing import Any


class RetrainingHistory:

    def __init__(self):
        self.history: list[dict[str, Any]] = []

    def add_record(
        self,
        trigger_type: str,
        trigger_details: dict,
        model_name: str,
        candidate_version: str,
        dataset_hash: str,
        training_records: int,
        metrics: dict,
        status: str,
        promotion_status: str = "pending",
        notes: str | None = None,
    ) -> dict:

        record = {
            "id": len(self.history) + 1,
            "trigger_type": trigger_type,
            "trigger_details": trigger_details,
            "model_name": model_name,
            "candidate_version": candidate_version,
            "dataset_hash": dataset_hash,
            "training_records": training_records,
            "metrics": metrics,
            "status": status,
            "promotion_status": promotion_status,
            "notes": notes,
            "created_at": datetime.utcnow().isoformat(),
        }

        self.history.append(record)

        return record

    def list_history(self) -> list[dict]:

        return list(
            reversed(self.history)
        )

    def get_record(
        self,
        record_id: int
    ) -> dict | None:

        for record in self.history:

            if record["id"] == record_id:
                return record

        return None

    def clear_history(self):

        self.history.clear()


retraining_history = RetrainingHistory()