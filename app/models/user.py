from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
)

from datetime import (
    datetime,
    timezone,
)

from app.database.connection import (
    Base,
)


# ============================================
# USER MODEL
# ============================================

class User(Base):

    __tablename__ = "users"


    # ========================================
    # PRIMARY KEY
    # ========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    # ========================================
    # USER INFORMATION
    # ========================================

    name = Column(
        String,
        nullable=False,
    )


    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )


    # ========================================
    # PASSWORD
    # ========================================

    password_hash = Column(
        String,
        nullable=False,
    )


    # ========================================
    # ROLE
    # ========================================

    role = Column(
        String,
        default="viewer",
        nullable=False,
    )


    # ========================================
    # STATUS
    # ========================================

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )


    # ========================================
    # CREATED TIME
    # ========================================

    created_at = Column(
        DateTime(
            timezone=True
        ),
        default=lambda:
            datetime.now(
                timezone.utc
            ),
        nullable=False,
    )