from typing import List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

        print("Dashboard WebSocket Connected")
        print("Active Connections:", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        print("Dashboard WebSocket Disconnected")
        print("Active Connections:", len(self.active_connections))

    async def send_personal_message(
        self,
        data: dict,
        websocket: WebSocket
    ):
        try:
            await websocket.send_json(data)
        except Exception as error:
            print("WebSocket Send Error:", str(error))

    async def broadcast(self, data: dict):
        disconnected_connections = []

        for connection in list(self.active_connections):
            try:
                await connection.send_json(data)
            except Exception as error:
                print("Broadcast Error:", str(error))
                disconnected_connections.append(connection)

        for connection in disconnected_connections:
            self.disconnect(connection)

    def get_connection_count(self):
        return len(self.active_connections)


# ============================================
# GLOBAL DASHBOARD WEBSOCKET MANAGER
# ============================================

dashboard_manager = ConnectionManager()
