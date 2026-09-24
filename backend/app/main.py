import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

# ============================================
# DATABASE MODELS
# ============================================

from app.models.recommendation import Recommendation
from app.models.user import User

# ============================================
# API ROUTERS
# ============================================

from app.api.v1.auth import router as auth_router
from app.api.v1.recommendations import router as recommendation_router
from app.api.v1.alerts import router as alert_router
from app.api.v1.resource_planning import (
    router as resource_planning_router
)
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.dashboard_websocket import (
    router as dashboard_websocket_router
)

# ============================================
# MODULE 9 - DASHBOARD AGENT
# ============================================

from app.agents.dashboard_agent import dashboard_agent
from app.websocket.manager import dashboard_manager


# ============================================
# DASHBOARD PREDICTION PROVIDER
# ============================================

def get_dashboard_predictions():
    """
    Returns the current dashboard prediction data.

    Currently this uses the existing dashboard
    PREDICTION_DATA source.

    Later this can be replaced with the real
    prediction database/service.
    """

    from app.api.v1.dashboard import PREDICTION_DATA

    return PREDICTION_DATA


# ============================================
# DASHBOARD BROADCAST CALLBACK
# ============================================

async def broadcast_dashboard_update(data: dict):
    """
    Broadcast dashboard updates to all connected
    WebSocket clients.
    """

    await dashboard_manager.broadcast(data)


# ============================================
# APPLICATION LIFESPAN
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("")
    print("==========================================")
    print("TECHNOVA Sentinel AI Starting...")
    print("==========================================")

    # ----------------------------------------
    # DATABASE INITIALIZATION
    # ----------------------------------------

    try:

        Base.metadata.create_all(
            bind=engine
        )

        print("Database Ready")

    except Exception as error:

        print(
            "Database Initialization Error:",
            str(error)
        )

    # ----------------------------------------
    # CONNECT DASHBOARD AGENT
    # ----------------------------------------

    dashboard_agent.broadcast_callback = (
        broadcast_dashboard_update
    )

    # ----------------------------------------
    # START DASHBOARD AGENT
    # ----------------------------------------

    dashboard_task = asyncio.create_task(

        dashboard_agent.start(

            predictions_provider=
                get_dashboard_predictions,

            interval=10,

        )

    )

    print("Dashboard Agent Started")
    print("Dashboard refresh interval: 10 seconds")
    print("WebSocket endpoint: /ws/dashboard")

    print("==========================================")
    print("TECHNOVA Sentinel AI Ready")
    print("==========================================")
    print("")

    try:

        yield

    finally:

        print("")
        print(
            "Stopping TECHNOVA Sentinel AI..."
        )

        # ------------------------------------
        # STOP DASHBOARD AGENT
        # ------------------------------------

        dashboard_agent.stop()

        dashboard_task.cancel()

        try:

            await dashboard_task

        except asyncio.CancelledError:

            pass

        print(
            "Dashboard Agent Stopped"
        )

        print(
            "TECHNOVA Sentinel AI Shutdown Complete"
        )


# ============================================
# FASTAPI APPLICATION
# ============================================

app = FastAPI(

    title="TECHNOVA Sentinel AI",

    description=(
        "AI-powered Disease Surge Prediction, "
        "Recommendation and Resource Planning System"
    ),

    version="1.0.0",

    lifespan=lifespan,

)


# ============================================
# CORS CONFIGURATION
# ============================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        # ------------------------------------
        # Localhost
        # ------------------------------------

        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",

        # ------------------------------------
        # 127.0.0.1
        # ------------------------------------

        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


# ============================================
# AUTHENTICATION ROUTER
# ============================================

app.include_router(

    auth_router,

    prefix="/api/v1",

)


# ============================================
# RECOMMENDATION ROUTER
# ============================================

app.include_router(

    recommendation_router,

    prefix="/api/v1",

)


# ============================================
# ALERT ROUTER
# ============================================

app.include_router(

    alert_router,

    prefix="/api/v1",

)


# ============================================
# RESOURCE PLANNING ROUTER
# ============================================

app.include_router(

    resource_planning_router,

    prefix="/api/v1",

)


# ============================================
# DASHBOARD WEBSOCKET
# ============================================

# IMPORTANT:
#
# WebSocket endpoint:
#
# ws://127.0.0.1:8000/ws/dashboard
#
# It does NOT use /api/v1 prefix.

app.include_router(

    dashboard_websocket_router

)


# ============================================
# DASHBOARD REST ROUTER
# ============================================

app.include_router(

    dashboard_router,

    prefix="/api/v1",

)


# ============================================
# ROOT ENDPOINT
# ============================================

@app.get("/")
def root():

    return {

        "status":
            "healthy",

        "service":
            "TECHNOVA Sentinel AI",

        "version":
            "1.0.0",

        "message":
            "TECHNOVA Sentinel AI API is running",

    }


# ============================================
# HEALTH ENDPOINT
# ============================================

@app.get("/health")
def health_check():

    return {

        "status":
            "healthy",

        "service":
            "TECHNOVA Sentinel AI",

    }