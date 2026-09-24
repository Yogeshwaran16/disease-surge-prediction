import { useEffect, useRef } from "react";
import useDashboardStore from "../store/dashboardStore";

const WS_URL = "ws://127.0.0.1:8000/ws/dashboard";

export default function useDashboardWebSocket() {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const setDashboardData =
    useDashboardStore(
      (state) => state.setDashboardData
    );

  const setConnected =
    useDashboardStore(
      (state) => state.setConnected
    );

  const setError =
    useDashboardStore(
      (state) => state.setError
    );

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      if (!mountedRef.current) {
        return;
      }

      try {
        const socket =
          new WebSocket(WS_URL);

        socketRef.current = socket;

        socket.onopen = () => {
          if (!mountedRef.current) {
            return;
          }

          setConnected(true);
        };

        socket.onmessage = (event) => {
          if (!mountedRef.current) {
            return;
          }

          try {
            const data =
              JSON.parse(event.data);

            setDashboardData(data);
          } catch (error) {
            setError(
              "Invalid dashboard WebSocket data"
            );
          }
        };

        socket.onerror = () => {
          if (!mountedRef.current) {
            return;
          }

          setError(
            "Dashboard WebSocket connection error"
          );
        };

        socket.onclose = () => {
          if (!mountedRef.current) {
            return;
          }

          setConnected(false);

          reconnectTimerRef.current =
            setTimeout(() => {
              connect();
            }, 5000);
        };
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        setConnected(false);
        setError(error);

        reconnectTimerRef.current =
          setTimeout(() => {
            connect();
          }, 5000);
      }
    };

    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(
          reconnectTimerRef.current
        );
      }

      if (socketRef.current) {
        socketRef.current.close();
      }

      socketRef.current = null;
    };
  }, [
    setDashboardData,
    setConnected,
    setError,
  ]);
}