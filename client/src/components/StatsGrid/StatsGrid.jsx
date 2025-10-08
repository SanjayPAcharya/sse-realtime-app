import React from "react";
import "./StatsGrid.css";

const StatsGrid = ({
  eventCount,
  connectionTime,
  lastEventTime,
  connectedClients,
  serverHealth,
}) => {
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-label">Events</div>
        <div className="stat-value">{eventCount}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Time</div>
        <div className="stat-value small">{connectionTime}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Last Event</div>
        <div className="stat-value small">{lastEventTime}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Clients</div>
        <div className="stat-value">
          {connectedClients ? connectedClients.count : "-"}
        </div>
      </div>
      {serverHealth && (
        <>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value small">{serverHealth.status}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Uptime</div>
            <div className="stat-value small">
              {Math.floor(serverHealth.uptime / 60)}m
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsGrid;
