from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


# ============================================
# REGISTER REQUEST
# ============================================

class RegisterRequest(
    BaseModel
):

    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=100,
    )

    role: str = "viewer"


# ============================================
# LOGIN REQUEST
# ============================================

class LoginRequest(
    BaseModel
):

    email: EmailStr

    password: str


# ============================================
# REFRESH TOKEN REQUEST
# ============================================

class RefreshTokenRequest(
    BaseModel
):

    refreshToken: str


# ============================================
# LOGOUT REQUEST
# ============================================

class LogoutRequest(
    BaseModel
):

    refreshToken: str


# ============================================
# FORGOT PASSWORD REQUEST
# ============================================

class ForgotPasswordRequest(
    BaseModel
):

    email: EmailStr


# ============================================
# RESET PASSWORD REQUEST
# ============================================

class ResetPasswordRequest(
    BaseModel
):

    token: str

    password: str = Field(
        min_length=6,
        max_length=100,
    )