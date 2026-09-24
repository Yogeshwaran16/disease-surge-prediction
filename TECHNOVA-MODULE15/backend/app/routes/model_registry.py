from fastapi import APIRouter, Depends, HTTPException

from app.api.utils.auth import get_current_user

from app.models.model_registry import model_registry

from app.schemas.model_version import ModelRegistrationRequest

from app.training.promotion_service import (
    promote_candidate,
    rollback_to_version,
)


router = APIRouter(
    prefix="/api/v1/models",
    tags=["Model Registry"],
)


@router.get("")
def list_models(
    current_user: dict = Depends(get_current_user),
):
    models = model_registry.list_models()

    return {
        "count": len(models),
        "models": models,
    }


@router.get("/champion")
def get_champion(
    current_user: dict = Depends(get_current_user),
):
    champion = model_registry.get_champion()

    if champion is None:
        return {
            "message": "No champion model registered",
            "champion": None,
        }

    return {
        "message": "Current champion model",
        "champion": champion,
    }


@router.get("/{version}")
def get_model(
    version: str,
    current_user: dict = Depends(get_current_user),
):
    model = model_registry.get_model(version)

    if model is None:
        raise HTTPException(
            status_code=404,
            detail="Model version not found",
        )

    return {
        "message": "Model found",
        "model": model,
    }


@router.post("")
def register_model(
    request: ModelRegistrationRequest,
    current_user: dict = Depends(get_current_user),
):
    existing_model = model_registry.get_model(request.version)

    if existing_model is not None:
        raise HTTPException(
            status_code=409,
            detail="Model version already exists",
        )

    model = model_registry.register_model(
        model_name=request.model_name,
        version=request.version,
        algorithm=request.algorithm,
        status=request.status,
        metrics=request.metrics,
        training_records=request.training_records,
        dataset_hash=request.dataset_hash,
        model_path=request.model_path,
    )

    return {
        "message": "Model registered successfully",
        "model": model,
    }


@router.post("/{version}/status")
def update_model_status(
    version: str,
    status: str,
    current_user: dict = Depends(get_current_user),
):
    allowed_statuses = [
        "candidate",
        "challenger",
        "champion",
        "archived",
        "rejected",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid model status",
                "allowed_statuses": allowed_statuses,
            },
        )

    model = model_registry.update_status(version, status)

    if model is None:
        raise HTTPException(
            status_code=404,
            detail="Model version not found",
        )

    return {
        "message": "Model status updated successfully",
        "model": model,
    }


@router.post("/{version}/promote")
def promote_model(
    version: str,
    minimum_delta: float = 0.02,
    current_user: dict = Depends(get_current_user),
):
    if minimum_delta < 0:
        raise HTTPException(
            status_code=400,
            detail="minimum_delta cannot be negative",
        )

    try:
        result = promote_candidate(
            candidate_version=version,
            minimum_delta=minimum_delta,
        )

        return {
            "message": "Promotion process completed",
            **result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.post("/{version}/rollback")
def rollback_model(
    version: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = rollback_to_version(version)

        return {
            "message": "Rollback completed successfully",
            **result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )