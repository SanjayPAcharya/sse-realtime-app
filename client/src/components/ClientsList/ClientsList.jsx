import React from "react";
import "./ClientsList.css";

const ClientsList = ({ clients }) => {
  if (!clients || !clients.clients || clients.clients.length === 0) {
    return null;
  }

  return (
    <div className="clients-card">
      <h3>👥 Connected Clients ({clients.count})</h3>
      <div className="clients-list">
        {clients.clients.map((client) => (
          <div key={client.id} className="client-item">
            <span className="client-id">ID: {client.id}</span>
            <span className="client-time">
              {new Date(client.connectedAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsList;
