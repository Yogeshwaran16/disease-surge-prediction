import { useEffect, useRef, useCallback } from "react";
import useDashboardStore from "../store/dashboardStore";

// ============================================================
// WEBSOCKET CONFIG
// ============================================================

const WS_URL = "ws://127.0.0.1:8000/ws/dashboard";

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 10000;
const HEARTBEAT_INTERVAL = 25000;


// ============================================================
// DASHBOARD WEBSOCKET HOOK
// ============================================================

export default function useDashboardWebSocket() {
  const socketRef = useRef(null);

  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  const reconnectAttemptsRef = useRef(0);

  const mountedRef = useRef(false);
  const intentionalDisconnectRef = useRef(false);

  // Used to identify the currently active socket.
  // This prevents an old socket's onclose/onerror
  // from affecting a newer connection.
  const connectionIdRef = useRef(0);

  const setDashboardData = useDashboardStore(
    (state) => state.setDashboardData
  );

  const setConnected = useDashboardStore(
    (state) => state.setConnected
  );

  const setError = useDashboardStore(
    (state) => state.setError
  );


  // ==========================================================
  // CLEAR RECONNECT TIMER
  // ==========================================================

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);


  // ==========================================================
  // CLEAR HEARTBEAT
  // ==========================================================

  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);


  // ==========================================================
  // START HEARTBEAT
  // ==========================================================

  const startHeartbeat = useCallback(
    (socket) => {
      clearHeartbeat();

      heartbeatTimerRef.current = setInterval(() => {
        if (
          socket === socketRef.current &&
          socket.readyState === WebSocket.OPEN
        ) {
          try {
            socket.send("ping");

            console.log(
              "Dashboard WebSocket heartbeat → ping"
            );
          } catch (error) {
            console.error(
              "Dashboard WebSocket heartbeat error:",
              error
            );
          }
        }
      }, HEARTBEAT_INTERVAL);
    },
    [clearHeartbeat]
  );


  // ==========================================================
  // SCHEDULE RECONNECT
  // ==========================================================

  const scheduleReconnect = useCallback(
    (socketId) => {
      if (!mountedRef.current) {
        return;
      }

      if (intentionalDisconnectRef.current) {
        return;
      }

      // Do not reconnect if another socket has already
      // become active.
      if (socketId !== connectionIdRef.current) {
        return;
      }

      clearReconnectTimer();

      const attempt = reconnectAttemptsRef.current;

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, attempt),
        MAX_RECONNECT_DELAY
      );

      reconnectAttemptsRef.current = attempt + 1;

      console.log(
        `Reconnecting Dashboard WebSocket in ${delay}ms...`
      );

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;

        if (
          mountedRef.current &&
          !intentionalDisconnectRef.current
        ) {
          connect();
        }
      }, delay);
    },
    [clearReconnectTimer]
  );


  // ==========================================================
  // CONNECT
  // ==========================================================

  const connect = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    intentionalDisconnectRef.current = false;

    // Existing active connection
    if (
      socketRef.current &&
      (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      )
    ) {
      console.log(
        "Dashboard WebSocket already connected/connecting"
      );

      return;
    }

    clearReconnectTimer();

    const socketId = connectionIdRef.current + 1;

    connectionIdRef.current = socketId;

    console.log(
      `Connecting Dashboard WebSocket... [connection ${socketId}]`
    );

    const socket = new WebSocket(WS_URL);

    socketRef.current = socket;


    // ========================================================
    // OPEN
    // ========================================================

    socket.onopen = () => {
      // Ignore stale socket
      if (
        socket !== socketRef.current ||
        socketId !== connectionIdRef.current
      ) {
        return;
      }

      console.log(
        `Dashboard WebSocket Connected [connection ${socketId}]`
      );

      reconnectAttemptsRef.current = 0;

      setConnected(true);
      setError(null);

      startHeartbeat(socket);

      // Request latest dashboard state
      try {
        socket.send("refresh");

        console.log(
          "Dashboard WebSocket → refresh"
        );
      } catch (error) {
        console.error(
          "Dashboard WebSocket refresh error:",
          error
        );
      }
    };


    // ========================================================
    // MESSAGE
    // ========================================================

    socket.onmessage = (event) => {
      // Ignore messages from stale socket
      if (
        socket !== socketRef.current ||
        socketId !== connectionIdRef.current
      ) {
        return;
      }

      try {
        const data = JSON.parse(event.data);

        console.log(
          "Dashboard WebSocket Data:",
          data
        );

        // -----------------------------------------------
        // Dashboard update
        // -----------------------------------------------

        if (data.event === "dashboard_update") {
          setDashboardData(data);
          return;
        }

        // -----------------------------------------------
        // Pong
        // -----------------------------------------------

        if (data.event === "pong") {
          console.log(
            "Dashboard WebSocket ← pong"
          );
          return;
        }

        // -----------------------------------------------
        // Fallback dashboard payload
        // -----------------------------------------------

        if (
          data.total_districts !== undefined ||
          data.total_predictions !== undefined
        ) {
          setDashboardData(data);
        }

      } catch (error) {
        console.error(
          "Dashboard WebSocket JSON Error:",
          error
        );

        setError(
          "Invalid dashboard WebSocket response"
        );
      }
    };


    // ========================================================
    // ERROR
    // ========================================================

    socket.onerror = (error) => {
      // Ignore stale socket errors
      if (
        socket !== socketRef.current ||
        socketId !== connectionIdRef.current
      ) {
        return;
      }

      console.error(
        "Dashboard WebSocket Error:",
        error
      );

      setError(
        "Dashboard WebSocket connection error"
      );
    };


    // ========================================================
    // CLOSE
    // ========================================================

    socket.onclose = (event) => {
      // Always clear heartbeat belonging to this socket
      if (socket === socketRef.current) {
        clearHeartbeat();
      }

      // Ignore stale socket close events
      if (
        socketId !== connectionIdRef.current
      ) {
        console.log(
          `Ignoring stale WebSocket close [connection ${socketId}]`
        );

        return;
      }

      console.log(
        `Dashboard WebSocket Disconnected [connection ${socketId}]`,
        {
          code: event.code,
          reason: event.reason || "No reason provided",
          wasClean: event.wasClean,
        }
      );

      setConnected(false);

      if (socket === socketRef.current) {
        socketRef.current = null;
      }

      if (!mountedRef.current) {
        return;
      }

      if (intentionalDisconnectRef.current) {
        return;
      }

      scheduleReconnect(socketId);
    };
  }, [
    clearReconnectTimer,
    clearHeartbeat,
    scheduleReconnect,
    startHeartbeat,
    setDashboardData,
    setConnected,
    setError,
  ]);


  // ==========================================================
  // MANUAL DISCONNECT
  // ==========================================================

  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true;

    clearReconnectTimer();
    clearHeartbeat();

    reconnectAttemptsRef.current = 0;

    const socket = socketRef.current;

    if (socket) {
      socketRef.current = null;

      try {
        socket.close(1000, "Client disconnect");
      } catch (error) {
        console.error(
          "Dashboard WebSocket close error:",
          error
        );
      }
    }

    setConnected(false);

    console.log(
      "Dashboard WebSocket manually disconnected"
    );
  }, [
    clearReconnectTimer,
    clearHeartbeat,
    setConnected,
  ]);


  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const refresh = useCallback(() => {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      console.log(
        "Requesting dashboard refresh..."
      );

      socket.send("refresh");

      return true;
    }

    console.warn(
      "Dashboard WebSocket is not connected. Refresh skipped."
    );

    return false;
  }, []);


  // ==========================================================
  // MANUAL PING
  // ==========================================================

  const ping = useCallback(() => {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      console.log(
        "Dashboard WebSocket → ping"
      );

      socket.send("ping");

      return true;
    }

    console.warn(
      "Dashboard WebSocket is not connected. Ping skipped."
    );

    return false;
  }, []);


  // ==========================================================
  // AUTO CONNECT
  // ==========================================================

  useEffect(() => {
    mountedRef.current = true;
    intentionalDisconnectRef.current = false;

    connect();

    return () => {
      mountedRef.current = false;
      intentionalDisconnectRef.current = true;

      clearReconnectTimer();
      clearHeartbeat();

      const socket = socketRef.current;

      socketRef.current = null;

      if (socket) {
        try {
          socket.close(
            1000,
            "Dashboard component unmounted"
          );
        } catch (error) {
          console.error(
            "Dashboard WebSocket cleanup error:",
            error
          );
        }
      }

      setConnected(false);
    };
  }, [
    connect,
    clearReconnectTimer,
    clearHeartbeat,
    setConnected,
  ]);


  // ==========================================================
  // RETURN API
  // ==========================================================

  return {
    connect,
    disconnect,
    refresh,
    ping,

    // Use this function instead of returning
    // socketRef.current directly because the latter
    // becomes stale between renders.
    getSocket: () => socketRef.current,
  };
}