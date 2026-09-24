from datetime import (
    datetime,
    timedelta,
    timezone,
)

from typing import (
    Optional,
)

from jose import (
    JWTError,
    jwt,
)

from passlib.context import (
    CryptContext,
)


# ============================================
# JWT CONFIGURATION
# ============================================

SECRET_KEY = (
    "technova-sentinel-ai-super-secret-key-change-in-production"
)

ALGORITHM = "HS256"


ACCESS_TOKEN_EXPIRE_MINUTES = 30

REFRESH_TOKEN_EXPIRE_DAYS = 7


# ============================================
# PASSWORD HASHING
# ============================================

pwd_context = CryptContext(
    schemes=[
        "bcrypt",
    ],
    deprecated="auto",
)


# ============================================
# PASSWORD FUNCTIONS
# ============================================

def hash_password(
    password: str,
) -> str:

    return pwd_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ============================================
# CREATE ACCESS TOKEN
# ============================================

def create_access_token(
    data: dict,
    expires_delta: Optional[
        timedelta
    ] = None,
) -> str:

    to_encode = data.copy()


    if expires_delta:

        expire = (
            datetime.now(
                timezone.utc
            )
            + expires_delta
        )

    else:

        expire = (
            datetime.now(
                timezone.utc
            )
            + timedelta(
                minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )


    to_encode.update(
        {
            "exp": expire,
            "type": "access",
        }
    )


    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================
# CREATE REFRESH TOKEN
# ============================================

def create_refresh_token(
    data: dict,
) -> str:

    to_encode = data.copy()


    expire = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            days=
            REFRESH_TOKEN_EXPIRE_DAYS
        )
    )


    to_encode.update(
        {
            "exp": expire,
            "type": "refresh",
        }
    )


    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================
# DECODE TOKEN
# ============================================

def decode_token(
    token: str,
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM,
            ],
        )


        return payload


    except JWTError:

        return None