import React, { useRef, useEffect } from "react";
import "./EventsFeed.css";

const DOT_COLOR = {
  info:           "var(--primary)",
  success:        "var(--positive)",
  warning:        "var(--warning)",
  error:          "var(--negative)",
  update:         "var(--purple)",
  connected:      "var(--positive)",
  "indices-update": "var(--primary)",
};

const EventsFeed = ({ events }) => {
  const prevLenRef = useRef(0);

  useEffect(() => {
    prevLenRef.current = events.length;
  }, [events]);

  return (
    <div className="events-slim">
      <div className="events-slim-header">
        <div className="events-slim-left">
          <span className="events-live-dot" />
          <span className="events-slim-title">Events</span>
        </div>
        <span className="events-slim-count">{events.length}</span>
      </div>

      <div className="events-slim-list">
        {events.length === 0 ? (
          <div className="events-slim-empty">Waiting for events…</div>
        ) : (
          events.map((e, i) => (
            <div
              key={`${e.timestamp}-${i}`}
              className={`event-slim ${i === 0 && events.length > prevLenRef.current ? "event-new" : ""}`}
            >
              <span
                className="event-slim-dot"
                style={{ background: DOT_COLOR[e.type] ?? "var(--text-3)" }}
              />
              <span className="event-slim-msg">{e.message}</span>
              <span className="event-slim-time">
                {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsFeed;
