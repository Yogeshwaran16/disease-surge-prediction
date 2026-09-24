from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.model_registry import router as model_registry_router
from app.routes.retraining_history import router as retraining_history_router

from app.api.v1.auth import router as auth_router
from app.api.v1.data import router as data_router
from app.api.v1.security_test import router as security_test_router


app = FastAPI(
    title="TECHNOVA Sentinel AI",
    version="1.0.0",
    description="TECHNOVA Sentinel AI versioned API platform",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "service": "TECHNOVA Sentinel AI",
    }


# Module 15 APIs
app.include_router(model_registry_router)
app.include_router(retraining_history_router)

# Module 16 APIs
app.include_router(auth_router)
app.include_router(data_router)
app.include_router(security_test_router)