from typing import Any

from app.database.connection import SessionLocal
from app.models.retraining_history_db import RetrainingHistoryRecord


class RetrainingHistory:

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

        db = SessionLocal()

        try:
            record = RetrainingHistoryRecord(
                trigger_type=trigger_type,
                trigger_details=trigger_details,
                model_name=model_name,
                candidate_version=candidate_version,
                dataset_hash=dataset_hash,
                training_records=training_records,
                metrics=metrics,
                status=status,
                promotion_status=promotion_status,
                notes=notes,
            )

            db.add(record)
            db.commit()
            db.refresh(record)

            return self._to_dict(record)

        finally:
            db.close()

    def list_history(self) -> list[dict]:

        db = SessionLocal()

        try:
            records = (
                db.query(RetrainingHistoryRecord)
                .order_by(
                    RetrainingHistoryRecord.created_at.desc()
                )
                .all()
            )

            return [
                self._to_dict(record)
                for record in records
            ]

        finally:
            db.close()

    def get_record(
        self,
        record_id: int
    ) -> dict | None:

        db = SessionLocal()

        try:
            record = (
                db.query(RetrainingHistoryRecord)
                .filter(
                    RetrainingHistoryRecord.id == record_id
                )
                .first()
            )

            if record is None:
                return None

            return self._to_dict(record)

        finally:
            db.close()

    def clear_history(self):

        db = SessionLocal()

        try:
            db.query(RetrainingHistoryRecord).delete()
            db.commit()

        finally:
            db.close()

    @staticmethod
    def _to_dict(
        record: RetrainingHistoryRecord
    ) -> dict[str, Any]:

        return {
            "id": record.id,
            "trigger_type": record.trigger_type,
            "trigger_details": record.trigger_details,
            "model_name": record.model_name,
            "candidate_version": record.candidate_version,
            "dataset_hash": record.dataset_hash,
            "training_records": record.training_records,
            "metrics": record.metrics,
            "status": record.status,
            "promotion_status": record.promotion_status,
            "notes": record.notes,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else None
            ),
        }


retraining_history = RetrainingHistory()
