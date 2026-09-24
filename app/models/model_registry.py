from datetime import datetime
from typing import Any

from app.database.connection import SessionLocal
from app.models.model_registry_db import ModelRegistryRecord


class ModelRegistry:

    def register_model(
        self,
        model_name: str,
        version: str,
        algorithm: str,
        status: str,
        metrics: dict,
        training_records: int,
        dataset_hash: str,
        model_path: str | None = None,
    ) -> dict:

        db = SessionLocal()

        try:
            record = ModelRegistryRecord(
                model_name=model_name,
                version=version,
                algorithm=algorithm,
                status=status,
                metrics=metrics,
                training_records=training_records,
                dataset_hash=dataset_hash,
                model_path=model_path,
                created_at=datetime.utcnow(),
            )

            db.add(record)
            db.commit()
            db.refresh(record)

            return self._to_dict(record)

        finally:
            db.close()

    def list_models(self) -> list[dict]:

        db = SessionLocal()

        try:
            records = (
                db.query(ModelRegistryRecord)
                .order_by(ModelRegistryRecord.created_at.desc())
                .all()
            )

            return [
                self._to_dict(record)
                for record in records
            ]

        finally:
            db.close()

    def get_model(
        self,
        version: str
    ) -> dict | None:

        db = SessionLocal()

        try:
            record = (
                db.query(ModelRegistryRecord)
                .filter(
                    ModelRegistryRecord.version == version
                )
                .first()
            )

            if record is None:
                return None

            return self._to_dict(record)

        finally:
            db.close()

    def get_champion(self) -> dict | None:

        db = SessionLocal()

        try:
            record = (
                db.query(ModelRegistryRecord)
                .filter(
                    ModelRegistryRecord.status == "champion"
                )
                .order_by(
                    ModelRegistryRecord.created_at.desc()
                )
                .first()
            )

            if record is None:
                return None

            return self._to_dict(record)

        finally:
            db.close()

    def update_status(
        self,
        version: str,
        status: str
    ) -> dict | None:

        db = SessionLocal()

        try:
            record = (
                db.query(ModelRegistryRecord)
                .filter(
                    ModelRegistryRecord.version == version
                )
                .first()
            )

            if record is None:
                return None

            record.status = status

            db.commit()
            db.refresh(record)

            return self._to_dict(record)

        finally:
            db.close()

    @staticmethod
    def _to_dict(
        record: ModelRegistryRecord
    ) -> dict[str, Any]:

        return {
            "id": record.id,
            "model_name": record.model_name,
            "version": record.version,
            "algorithm": record.algorithm,
            "status": record.status,
            "metrics": record.metrics,
            "training_records": record.training_records,
            "dataset_hash": record.dataset_hash,
            "model_path": record.model_path,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else None
            ),
        }


model_registry = ModelRegistry()
