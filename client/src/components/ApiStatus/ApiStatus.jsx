import React from "react";

const ApiStatus = ({ serverInfo, indicesCount, serverHealth, connectedClients, isConnected }) => {
  const items = [
    { name: "Root API",    active: !!serverInfo },
    { name: "Indices API", active: indicesCount > 0 },
    { name: "Health API",  active: !!serverHealth },
    { name: "Clients API", active: !!connectedClients },
    { name: "SSE Stream",  active: isConnected },
  ];

  return (
    <div className="api-status-card">
      <div className="card-title">API Status</div>
      <div className="api-status-list">
        {items.map(({ name, active }) => (
          <div key={name} className="api-status-item">
            <span className="api-status-name">{name}</span>
            <span className={`api-dot ${active ? "active" : ""}`}></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiStatus;
