import { useState, useRef, useCallback } from "react";
import { API_URL, API_ENDPOINTS } from "../utils/constants";

export const useSSE = (onIndicesUpdate) => {
  const [events, setEvents]               = useState([]);
  const [isConnected, setIsConnected]     = useState(false);
  const [eventCount, setEventCount]       = useState(0);
  const [connectionTime, setConnectionTime] = useState("00:00");
  const [lastEventTime, setLastEventTime] = useState(null);
  const [dataSource, setDataSource]       = useState(null);
  const [marketOpen, setMarketOpen]       = useState(null);

  const esRef        = useRef(null);
  const startRef     = useRef(null);
  const timerRef     = useRef(null);

  const addEvent = useCallback((data) => {
    setEvents(prev => [data, ...prev.slice(0, 49)]);
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      if (!startRef.current) return;
      const ms = Date.now() - startRef.current;
      const m = Math.floor(ms / 60000).toString().padStart(2, "0");
      const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
      setConnectionTime(`${m}:${s}`);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setConnectionTime("00:00");
  }, []);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      setIsConnected(false);
      stopTimer();
    }
  }, [stopTimer]);

  const connect = useCallback((onConnect) => {
    if (esRef.current) return;

    const es = new EventSource(`${API_URL}${API_ENDPOINTS.EVENTS}`);
    esRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      startRef.current = Date.now();
      startTimer();
      onConnect?.();
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Update source / market status whenever the server tells us
        if (data.source)     setDataSource(data.source);
        if (data.marketOpen !== undefined) setMarketOpen(data.marketOpen);

        // Initial snapshot on connect
        if (data.type === "connected" && data.indices?.length) {
          onIndicesUpdate?.(data.indices);
          addEvent({ ...data, message: data.message });
          setEventCount(c => c + 1);
          setLastEventTime(new Date(data.timestamp).toLocaleTimeString());
          return;
        }

        // Incremental index updates
        if (data.type === "indices-update" && data.indices?.length) {
          onIndicesUpdate?.(data.indices);
        }

        addEvent(data);
        setEventCount(c => c + 1);
        setLastEventTime(new Date(data.timestamp).toLocaleTimeString());
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    es.onerror = () => disconnect();
  }, [addEvent, startTimer, disconnect, onIndicesUpdate]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setEventCount(0);
    setLastEventTime(null);
  }, []);

  return {
    events, isConnected, eventCount, connectionTime,
    lastEventTime, dataSource, marketOpen,
    connect, disconnect, clearEvents,
  };
};
