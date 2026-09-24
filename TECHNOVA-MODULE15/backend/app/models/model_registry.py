from datetime import datetime
from typing import Any


class ModelRegistry:

    def __init__(self):
        self.models: list[dict[str, Any]] = []

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

        model = {
            "model_name": model_name,
            "version": version,
            "algorithm": algorithm,
            "status": status,
            "metrics": metrics,
            "training_records": training_records,
            "dataset_hash": dataset_hash,
            "model_path": model_path,
            "created_at": datetime.utcnow().isoformat(),
        }

        self.models.append(model)

        return model

    def list_models(self) -> list[dict]:
        return self.models

    def get_model(
        self,
        version: str
    ) -> dict | None:

        for model in self.models:
            if model["version"] == version:
                return model

        return None

    def get_champion(self) -> dict | None:

        for model in reversed(self.models):
            if model["status"] == "champion":
                return model

        return None

    def update_status(
        self,
        version: str,
        status: str
    ) -> dict | None:

        model = self.get_model(version)

        if model is None:
            return None

        model["status"] = status

        return model


model_registry = ModelRegistry()