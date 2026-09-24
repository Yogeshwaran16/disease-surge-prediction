import json

import websocket


WS_URL = "ws://127.0.0.1:8000/api/v1/ws/dashboard"


def main():
    print("====================================")
    print("TECHNOVA DASHBOARD WEBSOCKET TEST")
    print("====================================")

    ws = websocket.create_connection(WS_URL, timeout=5)

    connected_message = json.loads(ws.recv())

    print("Connection Message:")
    print(connected_message)

    ws.send("ping")

    response = json.loads(ws.recv())

    print("\nPing Response:")
    print(response)

    assert connected_message["type"] == "connection"
    assert response["type"] == "pong"

    ws.close()

    print("\n====================================")
    print("WEBSOCKET DASHBOARD VERIFIED")
    print("====================================")


if __name__ == "__main__":
    main()