import React from "react";

const Event = ({ event, isNew }) => {
  const isUp = event.data?.change >= 0;

  return (
    <div className={`event-item ${event.type} ${isNew ? "event-new" : ""}`}>
      <div className="event-row">
        <span className="event-badge">{event.type}</span>
        <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="event-message">{event.message}</div>
      {event.data && (
        <div className="event-data-row">
          <span className="event-data-chip">
            ₹{event.data.value.toLocaleString("en-IN")}
          </span>
          <span className={`event-data-chip ${isUp ? "up" : "down"}`}>
            {isUp ? "+" : ""}{event.data.change.toFixed(2)} ({event.data.changePercent}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default Event;
