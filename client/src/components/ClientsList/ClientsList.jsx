import React from "react";

const ClientsList = ({ clients }) => {
  if (!clients?.clients?.length) return null;

  return (
    <div className="clients-card">
      <div className="clients-header card-title">
        Connected Clients
        <span className="clients-count-badge">{clients.count}</span>
      </div>
      <div className="clients-list">
        {clients.clients.map((client) => (
          <div key={client.id} className="client-item">
            <span className="client-id">ID: {client.id}</span>
            <span className="client-time">{new Date(client.connectedAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsList;
