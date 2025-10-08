import { useState, useRef, useCallback } from "react";
import { API_URL, API_ENDPOINTS } from "../utils/constants";

export const useSSE = (onNiftyUpdate) => {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [connectionTime, setConnectionTime] = useState("00:00");
  const [lastEventTime, setLastEventTime] = useState("None");

  const eventSourceRef = useRef(null);
  const connectionStartRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const addEvent = useCallback((data) => {
    setEvents((prev) => [data, ...prev.slice(0, 49)]);
  }, []);

  const startTimer = useCallback(() => {
    timerIntervalRef.current = setInterval(() => {
      if (connectionStartRef.current) {
        const elapsed = Date.now() - connectionStartRef.current;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setConnectionTime(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setConnectionTime("00:00");
  }, []);

  const connect = useCallback(
    (onConnect) => {
      if (eventSourceRef.current) {
        console.log("Already connected");
        return;
      }

      console.log("🔌 Connecting to SSE...");
      const eventSource = new EventSource(`${API_URL}${API_ENDPOINTS.EVENTS}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE connection opened");
        setIsConnected(true);
        connectionStartRef.current = Date.now();
        startTimer();

        if (onConnect) {
          onConnect();
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received event:", data);

          if (data.data && onNiftyUpdate) {
            onNiftyUpdate(data.data);
          }

          addEvent(data);
          setEventCount((prev) => prev + 1);
          setLastEventTime(new Date(data.timestamp).toLocaleTimeString());
        } catch (error) {
          console.error("❌ Error parsing event:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE error:", error);
        disconnect();
      };
    },
    [addEvent, startTimer, onNiftyUpdate]
  );

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      stopTimer();
      console.log("🔌 Disconnected from SSE");
    }
  }, [stopTimer]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setEventCount(0);
    setLastEventTime("None");
  }, []);

  return {
    events,
    isConnected,
    eventCount,
    connectionTime,
    lastEventTime,
    connect,
    disconnect,
    clearEvents,
  };
};
