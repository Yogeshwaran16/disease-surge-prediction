from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.prediction_service import (
    get_latest_prediction,
    get_latest_predictions,
    get_model_info,
)


router = APIRouter(
    prefix="/predictions",
    tags=["Module 5 - Prediction Engine"],
)


@router.get("/model")
def prediction_model_info():
    """
    Return the active Tier-1 prediction model metadata.
    """
    return {
        "success": True,
        "data": get_model_info(),
    }


@router.get("")
def predictions(
    district: Optional[str] = Query(
        default=None,
        min_length=1,
    ),
    disease: Optional[str] = Query(
        default=None,
        min_length=1,
    ),
):
    """
    Module 5 primary prediction endpoint.

    Returns the latest Tier-1 prediction for all available
    district + disease combinations, optionally filtered.
    """
    predictions = get_latest_predictions(
        district=district,
        disease=disease,
    )

    return {
        "success": True,
        "count": len(predictions),
        "data": predictions,
    }


@router.get("/latest")
def latest_prediction(
    district: str = Query(..., min_length=1),
    disease: str = Query(..., min_length=1),
):
    """
    Generate the latest Tier-1 prediction for a
    district + disease combination.
    """
    try:
        prediction = get_latest_prediction(
            district=district,
            disease=disease,
        )

        return {
            "success": True,
            "data": prediction,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.get("/latest/all")
def latest_predictions(
    district: Optional[str] = Query(
        default=None,
        min_length=1,
    ),
    disease: Optional[str] = Query(
        default=None,
        min_length=1,
    ),
):
    """
    Generate the latest Tier-1 prediction for every
    available district + disease combination.
    """
    predictions = get_latest_predictions(
        district=district,
        disease=disease,
    )

    return {
        "success": True,
        "count": len(predictions),
        "data": predictions,
    }