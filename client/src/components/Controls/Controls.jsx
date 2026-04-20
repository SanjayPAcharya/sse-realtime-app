import React from "react";

const Controls = ({
  isConnected, onConnect, onDisconnect, onClearEvents,
  onSendEvent, onRefreshIndices, onCheckHealth, onGetClients,
}) => (
  <div className="controls-card">
    <div className="card-title">Actions</div>
    <div className="controls-group">
      <button className="btn btn-filled"  onClick={onConnect}        disabled={isConnected}>Connect</button>
      <button className="btn btn-danger"  onClick={onDisconnect}     disabled={!isConnected}>Disconnect</button>
      <button className="btn btn-tonal"   onClick={onSendEvent}>Send Event</button>
      <button className="btn btn-tonal"   onClick={onRefreshIndices}>Refresh</button>
      <button className="btn btn-ghost"   onClick={onCheckHealth}>Health</button>
      <button className="btn btn-ghost"   onClick={onGetClients}>Clients</button>
      <button className="btn btn-ghost"   onClick={onClearEvents}>Clear</button>
    </div>
  </div>
);

export default Controls;
