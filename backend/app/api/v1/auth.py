from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/health")
def auth_health():
    return {
        "success": True,
        "service": "Authentication",
        "status": "healthy",
    }