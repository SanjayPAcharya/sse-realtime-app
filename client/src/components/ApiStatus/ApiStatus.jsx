import React from "react";
import "./ApiStatus.css";

const ApiStatus = ({
  serverInfo,
  currentNifty,
  serverHealth,
  connectedClients,
  isConnected,
}) => {
  return (
    <div className="api-status">
      <div className="status-item">
        <span className={`status-dot ${serverInfo ? "active" : ""}`}></span>
        <span>Root</span>
      </div>
      <div className="status-item">
        <span className={`status-dot ${currentNifty ? "active" : ""}`}></span>
        <span>Nifty</span>
      </div>
      <div className="status-item">
        <span className={`status-dot ${serverHealth ? "active" : ""}`}></span>
        <span>Health</span>
      </div>
      <div className="status-item">
        <span
          className={`status-dot ${connectedClients ? "active" : ""}`}
        ></span>
        <span>Clients</span>
      </div>
      <div className="status-item">
        <span className={`status-dot ${isConnected ? "active" : ""}`}></span>
        <span>SSE</span>
      </div>
    </div>
  );
};

export default ApiStatus;
