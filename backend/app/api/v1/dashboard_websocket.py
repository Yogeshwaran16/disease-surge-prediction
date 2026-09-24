from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import dashboard_manager
from app.agents.dashboard_agent import dashboard_agent


# ============================================
# ROUTER
# ============================================

router = APIRouter(
    tags=["Dashboard WebSocket"]
)


# ============================================
# DASHBOARD WEBSOCKET
# ============================================

@router.websocket("/ws/dashboard")
async def dashboard_websocket(
    websocket: WebSocket
):

    await dashboard_manager.connect(
        websocket
    )

    try:

        # ------------------------------------
        # INITIAL DATA
        # ------------------------------------

        from app.api.v1.dashboard import (
            PREDICTION_DATA
        )

        dashboard_data = (
            dashboard_agent.get_dashboard_data(
                PREDICTION_DATA
            )
        )

        dashboard_data["event"] = (
            "dashboard_update"
        )

        await dashboard_manager.send_personal_message(
            dashboard_data,
            websocket
        )

        # ------------------------------------
        # RECEIVE CLIENT MESSAGES
        # ------------------------------------

        while True:

            message = await websocket.receive_text()

            message = message.lower().strip()

            # --------------------------------
            # REFRESH
            # --------------------------------

            if message == "refresh":

                from app.api.v1.dashboard import (
                    PREDICTION_DATA
                )

                dashboard_data = (
                    dashboard_agent.get_dashboard_data(
                        PREDICTION_DATA
                    )
                )

                dashboard_data["event"] = (
                    "dashboard_update"
                )

                await dashboard_manager.send_personal_message(
                    dashboard_data,
                    websocket
                )

            # --------------------------------
            # PING
            # --------------------------------

            elif message == "ping":

                await dashboard_manager.send_personal_message(

                    {
                        "event": "pong"
                    },

                    websocket

                )

    except WebSocketDisconnect:

        dashboard_manager.disconnect(
            websocket
        )

    except Exception as error:

        print(
            "Dashboard WebSocket Error:",
            str(error)
        )

        dashboard_manager.disconnect(
            websocket
        )