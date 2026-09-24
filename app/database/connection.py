

import os

from sqlalchemy import create_engine

from sqlalchemy.orm import (
    DeclarativeBase,
    sessionmaker,
)


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./recommendations.db",
)


engine = create_engine(
    DATABASE_URL,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """
    Base class for database models.
    """

    pass


def get_db():
    """
    Provide database session.
    """

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()