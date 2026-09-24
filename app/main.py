import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================
# DATABASE
# ============================================

from app.database.connection import Base, engine


# ============================================
# REPORT SCHEDULER
# ============================================

from app.scheduler.report_scheduler import (
    start_report_scheduler,
    stop_report_scheduler,
)


# ============================================
# MODELS
# ============================================

from app.models.recommendation import Recommendation
from app.models.user import User
from app.models.report import Report


# ============================================
# API ROUTERS
# ============================================

from app.api.v1.auth import (
    router as auth_router,
)

from app.api.v1.recommendations import (
    router as recommendation_router,
)

from app.api.v1.alerts import (
    router as alert_router,
)

from app.api.v1.resource_planning import (
    router as resource_planning_router,
)

from app.api.v1.dashboard import (
    router as dashboard_router,
)
from app.api.v1.predictions import (
    router as prediction_router,
)

from app.api.v1.districts import (
    router as district_router,
)

from app.api.v1.data_source import (
    router as data_source_router,
)

from app.api.v1.reports.router import (
    router as reports_router,
)

from app.api.v1.hospitals import (
    router as hospitals_router,
)

from app.api.v1.explanations import (
    router as explanations_router,
)


# ============================================
# MODULE 9 - DASHBOARD WEBSOCKET
# ============================================

from app.api.v1.dashboard_websocket import (
    dashboard_websocket,
)


# ============================================
# MODULE 9 - DASHBOARD AGENT
# ============================================

from app.agents.dashboard_agent import (
    dashboard_agent,
)

from app.websocket.manager import (
    dashboard_manager,
)


# ============================================
# AGENT MONITORING
# ============================================

from app.agent_monitoring.router import (
    router as agent_monitoring_router,
)


# ============================================
# DASHBOARD PREDICTION PROVIDER
# ============================================

def get_dashboard_predictions():
    """
    Returns the latest district-level dashboard
    records for the Dashboard Agent.

    Module 5 Prediction Engine remains on hold.
    """

    from app.services.dashboard_service import (
        get_dashboard_predictions as load_dashboard_predictions,
    )

    return load_dashboard_predictions()

# ============================================
# DASHBOARD WEBSOCKET BROADCAST
# ============================================

async def broadcast_dashboard_update(
    data: dict,
):
    """
    Broadcast dashboard updates to all
    connected WebSocket clients.
    """

    await dashboard_manager.broadcast(
        data
    )


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

        print(
            "Database Ready"
        )

    except Exception as error:

        print(
            "Database Initialization Error:",
            str(error),
        )


    # ----------------------------------------
    # REPORT SCHEDULER
    # ----------------------------------------

    try:

        start_report_scheduler()

        print(
            "Report Scheduler Started"
        )

    except Exception as error:

        print(
            "Report Scheduler Error:",
            str(error),
        )


    # ----------------------------------------
    # DASHBOARD AGENT CONFIGURATION
    # ----------------------------------------

    dashboard_agent.broadcast_callback = (
        broadcast_dashboard_update
    )


    # ----------------------------------------
    # START DASHBOARD AGENT
    # ----------------------------------------

    dashboard_task = asyncio.create_task(

        dashboard_agent.start(

            predictions_provider=(
                get_dashboard_predictions
            ),

            interval=10,

        )

    )


    print(
        "Dashboard Agent Started"
    )

    print(
        "Dashboard refresh interval: 10 seconds"
    )

    print(
        "WebSocket endpoint: /ws/dashboard"
    )

    print(
        "=========================================="
    )

    print(
        "TECHNOVA Sentinel AI Ready"
    )

    print(
        "=========================================="
    )

    print("")


    try:

        yield


    finally:

        print("")

        print(
            "Stopping TECHNOVA Sentinel AI..."
        )


        # ------------------------------------
        # STOP REPORT SCHEDULER
        # ------------------------------------

        try:

            stop_report_scheduler()

            print(
                "Report Scheduler Stopped"
            )

        except Exception as error:

            print(
                "Report Scheduler Shutdown Error:",
                str(error),
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
# CORS
# ============================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",

        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",

    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],

)


# ============================================
# API ROUTES
# ============================================


# --------------------------------------------
# MODULE 1 - AUTHENTICATION
# --------------------------------------------

app.include_router(

    auth_router,

    prefix="/api/v1",

)


# --------------------------------------------
# RECOMMENDATIONS
# --------------------------------------------

app.include_router(

    recommendation_router,

    prefix="/api/v1",

)


# --------------------------------------------
# ALERTS
# --------------------------------------------

app.include_router(

    alert_router,

    prefix="/api/v1",

)


# --------------------------------------------
# MODULE 8 - RESOURCE PLANNING
# --------------------------------------------

app.include_router(

    resource_planning_router,

    prefix="/api/v1",

)


# --------------------------------------------
# MODULE 9 - DASHBOARD REST API
# --------------------------------------------

app.include_router(

    dashboard_router,

    prefix="/api/v1",

)


# --------------------------------------------
# MODULE 5 - PREDICTION ENGINE
# --------------------------------------------

app.include_router(

    prediction_router,

    prefix="/api/v1",

)


# --------------------------------------------
# DISTRICTS
# --------------------------------------------

app.include_router(

    district_router,

    prefix="/api/v1",

)


# --------------------------------------------
# HOSPITALS
# --------------------------------------------

app.include_router(

    hospitals_router,

    prefix="/api/v1",

)

app.include_router(

    explanations_router,

    prefix="/api/v1",

)



# --------------------------------------------
# MODULE 12 - DATA SOURCES
# --------------------------------------------

app.include_router(

    data_source_router,

    prefix="/api/v1",

)


# --------------------------------------------
# MODULE 13 - REPORTS
# --------------------------------------------

app.include_router(

    reports_router,

    prefix="/api/v1",

)


# ============================================
# MODULE 9 - DASHBOARD WEBSOCKET
# ============================================

app.add_api_websocket_route(

    "/ws/dashboard",

    dashboard_websocket,

)


# ============================================
# AGENT MONITORING
# ============================================

app.include_router(

    agent_monitoring_router,

    prefix="/api/v1",

)


# ============================================
# ROOT ENDPOINT
# ============================================

@app.get("/")
def root():

    return {

        "status": "healthy",

        "service": "TECHNOVA Sentinel AI",

        "version": "1.0.0",

        "message": (
            "TECHNOVA Sentinel AI API is running"
        ),

    }


# ============================================
# HEALTH ENDPOINT
# ============================================

@app.get("/health")
def health_check():

    return {

        "status": "healthy",

        "service": "TECHNOVA Sentinel AI",

    }








