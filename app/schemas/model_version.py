from typing import Optional

from pydantic import BaseModel, Field


class ModelRegistrationRequest(BaseModel):

    model_name: str

    version: str

    algorithm: str

    status: str = "challenger"

    metrics: dict[str, float] = Field(
        default_factory=dict
    )

    training_records: int = 0

    dataset_hash: str

    model_path: Optional[str] = None