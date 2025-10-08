export const API_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:3001";

export const EVENT_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  UPDATE: "update",
};

export const API_ENDPOINTS = {
  ROOT: "/",
  EVENTS: "/api/events",
  NIFTY: "/api/nifty",
  HEALTH: "/api/health",
  CLIENTS: "/api/clients",
  SEND_EVENT: "/api/send-event",
};
