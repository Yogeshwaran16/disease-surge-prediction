from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from app.websocket.manager import (
    dashboard_manager,
)

from app.agents.dashboard_agent import (
    dashboard_agent,
)

from app.services.dashboard_service import (
    get_dashboard_predictions,
)


# ============================================
# ROUTER
# ============================================

router = APIRouter(
    tags=[
        "Dashboard WebSocket",
    ],
)


# ============================================
# WEBSOCKET
# /ws/dashboard
# ============================================

@router.websocket(
    "/ws/dashboard"
)
async def dashboard_websocket(
    websocket: WebSocket,
):

    # ========================================
    # CONNECT CLIENT
    # ========================================

    await dashboard_manager.connect(
        websocket
    )

    try:

        # ====================================
        # LOAD DASHBOARD PREDICTIONS
        # ====================================

        predictions = (
            get_dashboard_predictions()
        )


        # ====================================
        # SEND INITIAL DATA
        # ====================================

        initial_data = (
            dashboard_agent.get_dashboard_data(
                predictions
            )
        )


        initial_data[
            "event"
        ] = "dashboard_update"


        await dashboard_manager.send_personal_message(
            initial_data,
            websocket,
        )


        # ====================================
        # KEEP CONNECTION ALIVE
        # ====================================

        while True:

            try:

                message = (
                    await websocket.receive_text()
                )


                # =================================
                # CLIENT REQUEST - REFRESH
                # =================================

                if (
                    message.lower()
                    == "refresh"
                ):

                    predictions = (
                        get_dashboard_predictions()
                    )


                    dashboard_data = (
                        dashboard_agent.get_dashboard_data(
                            predictions
                        )
                    )


                    dashboard_data[
                        "event"
                    ] = "dashboard_update"


                    await dashboard_manager.send_personal_message(
                        dashboard_data,
                        websocket,
                    )


                # =================================
                # CLIENT REQUEST - PING
                # =================================

                elif (
                    message.lower()
                    == "ping"
                ):

                    await dashboard_manager.send_personal_message(
                        {
                            "event": "pong"
                        },
                        websocket,
                    )


            except WebSocketDisconnect:

                raise


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