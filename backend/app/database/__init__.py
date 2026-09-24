from sqlalchemy import create_engine

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# ============================================
# DATABASE URL
# ============================================

DATABASE_URL = (
    "sqlite:///./technova.db"
)


# ============================================
# DATABASE ENGINE
# ============================================

engine = create_engine(

    DATABASE_URL,

    connect_args={
        "check_same_thread": False,
    },

)


# ============================================
# DATABASE SESSION
# ============================================

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine,

)


# ============================================
# DATABASE BASE
# ============================================

Base = declarative_base()


# ============================================
# DATABASE DEPENDENCY
# ============================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()