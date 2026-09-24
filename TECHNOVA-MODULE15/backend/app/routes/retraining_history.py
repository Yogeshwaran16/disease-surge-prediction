from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.utils.auth import get_current_user
from app.models.retraining_history import retraining_history


router = APIRouter(
    prefix="/api/v1/retraining",
    tags=["Retraining History"]
)


@router.get("/history")
def get_retraining_history(
    page: int = Query(
        default=1,
        ge=1,
        description="Page number"
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Number of records per page"
    ),
    current_user: dict = Depends(get_current_user)
):
    history = retraining_history.list_history()

    total = len(history)

    start = (page - 1) * page_size
    end = start + page_size

    paginated_history = history[start:end]

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0 else 0
    )

    return {
        "count": len(paginated_history),
        "history": paginated_history,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": end < total,
            "has_previous": page > 1
        }
    }