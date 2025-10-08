import React from "react";
import "./ServerInfo.css";

const ServerInfo = ({ data }) => {
  if (!data) return null;

  return (
    <div className="info-card">
      <h3>🖥️ Server Information</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className="info-value">{data.message}</span>
        </div>
        {data.endpoints && (
          <div className="info-item">
            <span className="info-label">Endpoints:</span>
            <span className="info-value">
              {Object.keys(data.endpoints).length} active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerInfo;
