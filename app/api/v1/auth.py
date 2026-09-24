from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from sqlalchemy.orm import (
    Session,
)

from app.database.connection import (
    SessionLocal,
)

from app.models.user import (
    User,
)

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    LogoutRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


# ============================================
# ROUTER
# ============================================

router = APIRouter(
    prefix="/auth",
    tags=[
        "Authentication",
    ],
)


# ============================================
# SECURITY
# ============================================

security = HTTPBearer()


# ============================================
# DATABASE SESSION
# ============================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ============================================
# USER RESPONSE HELPER
# ============================================

def format_user(
    user: User,
):

    return {

        "id":
            user.id,

        "name":
            user.name,

        "email":
            user.email,

        "role":
            user.role,

        "is_active":
            user.is_active,

    }


# ============================================
# REGISTER
# POST /api/v1/auth/register
# ============================================

@router.post(
    "/register",
)
def register(
    data: RegisterRequest,
    db: Session = Depends(
        get_db
    ),
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == data.email
        )
        .first()
    )


    if existing_user:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Email already registered",

        )


    allowed_roles = [

        "admin",

        "health_officer",

        "viewer",

    ]


    role = (
        data.role
        if data.role in allowed_roles
        else "viewer"
    )


    new_user = User(

        name=
            data.name,

        email=
            data.email,

        password_hash=
            hash_password(
                data.password
            ),

        role=
            role,

    )


    db.add(
        new_user
    )

    db.commit()

    db.refresh(
        new_user
    )


    return {

        "success":
            True,

        "message":
            "User registered successfully",

        "user":
            format_user(
                new_user
            ),

    }


# ============================================
# LOGIN
# POST /api/v1/auth/login
# ============================================

@router.post(
    "/login",
)
def login(
    data: LoginRequest,
    db: Session = Depends(
        get_db
    ),
):

    user = (

        db.query(User)

        .filter(
            User.email == data.email
        )

        .first()

    )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid email or password",

        )


    if not verify_password(

        data.password,

        user.password_hash,

    ):

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid email or password",

        )


    if not user.is_active:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "User account is inactive",

        )


    token_data = {

        "sub":
            str(
                user.id
            ),

        "email":
            user.email,

        "role":
            user.role,

    }


    access_token = (
        create_access_token(
            token_data
        )
    )


    refresh_token = (
        create_refresh_token(
            token_data
        )
    )


    return {

        "success":
            True,

        "message":
            "Login successful",

        "accessToken":
            access_token,

        "refreshToken":
            refresh_token,

        "user":
            format_user(
                user
            ),

    }


# ============================================
# PROFILE
# GET /api/v1/auth/profile
# ============================================

@router.get(
    "/profile",
)
def get_profile(

    credentials:
        HTTPAuthorizationCredentials =
            Depends(
                security
            ),

    db: Session = Depends(
        get_db
    ),

):

    token = (
        credentials.credentials
    )


    payload = decode_token(
        token
    )


    if not payload:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid token",

        )


    if (

        payload.get(
            "type"
        )

        != "access"

    ):

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid access token",

        )


    user_id = (
        payload.get(
            "sub"
        )
    )


    user = (

        db.query(User)

        .filter(
            User.id == int(
                user_id
            )
        )

        .first()

    )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User not found",

        )


    return {

        "success":
            True,

        "user":
            format_user(
                user
            ),

    }


# ============================================
# REFRESH TOKEN
# POST /api/v1/auth/refresh
# ============================================

@router.post(
    "/refresh",
)
def refresh_token(
    data: RefreshTokenRequest,
):

    payload = decode_token(
        data.refreshToken
    )


    if not payload:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid refresh token",

        )


    if (

        payload.get(
            "type"
        )

        != "refresh"

    ):

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid refresh token",

        )


    new_token_data = {

        "sub":
            payload.get(
                "sub"
            ),

        "email":
            payload.get(
                "email"
            ),

        "role":
            payload.get(
                "role"
            ),

    }


    new_access_token = (

        create_access_token(
            new_token_data
        )

    )


    return {

        "success":
            True,

        "accessToken":
            new_access_token,

    }


# ============================================
# LOGOUT
# POST /api/v1/auth/logout
# ============================================

@router.post(
    "/logout",
)
def logout(
    data: LogoutRequest,
):

    # JWT is stateless.
    # Frontend removes tokens after this call.

    return {

        "success":
            True,

        "message":
            "Logout successful",

    }


# ============================================
# FORGOT PASSWORD
# POST /api/v1/auth/forgot-password
# ============================================

@router.post(
    "/forgot-password",
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(
        get_db
    ),
):

    user = (

        db.query(User)

        .filter(
            User.email == data.email
        )

        .first()

    )


    # Security: don't reveal whether email exists

    return {

        "success":
            True,

        "message":
            "If the email exists, password reset instructions have been initiated.",

    }


# ============================================
# RESET PASSWORD
# POST /api/v1/auth/reset-password
# ============================================

@router.post(
    "/reset-password",
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(
        get_db
    ),
):

    payload = decode_token(
        data.token
    )


    if not payload:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired reset token",

        )


    user_id = (
        payload.get(
            "sub"
        )
    )


    if not user_id:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid reset token",

        )


    user = (

        db.query(User)

        .filter(
            User.id == int(
                user_id
            )
        )

        .first()

    )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_404_NOT_FOUND,

            detail=
                "User not found",

        )


    user.password_hash = (
        hash_password(
            data.password
        )
    )


    db.commit()


    return {

        "success":
            True,

        "message":
            "Password reset successfully",

    }