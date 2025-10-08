import React from "react";
import "./Controls.css";

const Controls = ({
  isConnected,
  onConnect,
  onDisconnect,
  onClearEvents,
  onSendEvent,
  onRefreshNifty,
  onCheckHealth,
  onGetClients,
  onShowData,
}) => {
  return (
    <div className="controls">
      <button
        className="btn-primary"
        onClick={onConnect}
        disabled={isConnected}
      >
        Connect
      </button>
      <button
        className="btn-danger"
        onClick={onDisconnect}
        disabled={!isConnected}
      >
        Disconnect
      </button>
      <button className="btn-primary" onClick={onClearEvents}>
        Clear
      </button>
      <button className="btn-primary" onClick={onSendEvent}>
        Send Event
      </button>
      <button className="btn-primary" onClick={onRefreshNifty}>
        Refresh
      </button>
      <button className="btn-primary" onClick={onCheckHealth}>
        Health
      </button>
      <button className="btn-primary" onClick={onGetClients}>
        Clients
      </button>
      <button className="btn-secondary" onClick={onShowData}>
        Show Data
      </button>
    </div>
  );
};

export default Controls;
