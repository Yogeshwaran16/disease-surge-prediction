from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.api.utils.auth import JWT_SECRET, JWT_ALGORITHM


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(request: LoginRequest):
    # Module 16 development authentication
    # Replace with the project's real user store when available.
    if request.username != "admin" or request.password != "technova123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    now = datetime.now(timezone.utc)

    payload = {
        "sub": request.username,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(hours=1),
    }

    token = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 3600,
    }