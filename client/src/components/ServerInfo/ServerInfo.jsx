import React from "react";

const ServerInfo = ({ data }) => {
  if (!data) return null;

  return (
    <div className="server-info-card">
      <div className="card-title">Server Info</div>
      <div className="server-info-row">
        <span className="server-info-key">Status</span>
        <span className="server-info-val">Online</span>
      </div>
      {data.endpoints && (
        <div className="server-info-row">
          <span className="server-info-key">Endpoints</span>
          <span className="server-info-val">{Object.keys(data.endpoints).length} active</span>
        </div>
      )}
    </div>
  );
};

export default ServerInfo;
