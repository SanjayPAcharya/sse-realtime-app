import React from "react";
import "./Event.css";

const Event = ({ event, isNew = false }) => {
  return (
    <div className={`event ${event.type} ${isNew ? "event-new" : ""}`}>
      <div className="event-header">
        <span className="event-type">{event.type}</span>
        <span className="event-time">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="event-message">{event.message}</div>
      {event.data && (
        <div className="event-data">
          <span className="mini-stat">
            ₹{event.data.value.toLocaleString("en-IN")}
          </span>
          <span
            className={`mini-stat ${
              event.data.change >= 0 ? "positive" : "negative"
            }`}
          >
            {event.data.change >= 0 ? "+" : ""}
            {event.data.change.toFixed(2)} ({event.data.changePercent}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default Event;
