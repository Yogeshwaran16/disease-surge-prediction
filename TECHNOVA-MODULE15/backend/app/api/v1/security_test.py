from fastapi import APIRouter, Depends

from app.api.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/v1/security",
    tags=["Security"]
)


@router.get("/protected")
def protected_endpoint(
    current_user: dict = Depends(get_current_user),
):
    return {
        "message": "JWT authentication successful",
        "user": current_user,
    }