import React from "react";

const sourceLabel = (s) => {
  if (s === "nse")        return { label: "NSE Live",  cls: "status-ok" };
  if (s === "yahoo")      return { label: "Yahoo",     cls: "status-ok" };
  if (s === "simulation") return { label: "Simulated", cls: "status-warn" };
  return { label: "—", cls: "" };
};

const StatsGrid = ({
  eventCount, connectionTime, lastEventTime,
  connectedClients, serverHealth, indicesCount, dataSource,
}) => {
  const uptimeMin = serverHealth ? Math.floor(serverHealth.uptime / 60) : null;
  const src = sourceLabel(dataSource);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-label">Indices</div>
        <div className="stat-value">{indicesCount || "—"}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⚡</div>
        <div className="stat-label">Events</div>
        <div className="stat-value">{eventCount}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⏱</div>
        <div className="stat-label">Connected</div>
        <div className="stat-value mono">{connectionTime}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-label">Clients</div>
        <div className="stat-value">{connectedClients ? connectedClients.count : "—"}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📡</div>
        <div className="stat-label">Source</div>
        <div className={`stat-value ${src.cls}`}>{src.label}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🕒</div>
        <div className="stat-label">Uptime</div>
        <div className="stat-value mono">{uptimeMin !== null ? `${uptimeMin}m` : "—"}</div>
      </div>
    </div>
  );
};

export default StatsGrid;
