from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter(
    prefix="/api/v1/ws",
    tags=["WebSocket"],
)


@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        await websocket.send_json({
            "type": "connection",
            "message": "TECHNOVA dashboard WebSocket connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        while True:
            message = await websocket.receive_text()

            if message.lower() == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "message": "Dashboard channel is active",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
            else:
                await websocket.send_json({
                    "type": "dashboard_update",
                    "message": message,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

    except WebSocketDisconnect:
        print("Dashboard WebSocket disconnected")