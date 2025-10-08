import React, { useEffect, useRef } from "react";
import Event from "../Event/Event";
import "./EventsFeed.css";

const EventsFeed = ({ events }) => {
  const prevEventsLengthRef = useRef(0);

  useEffect(() => {
    prevEventsLengthRef.current = events.length;
  }, [events]);

  return (
    <div className="events-section">
      <div className="events-header">
        <h3>📡 Live Updates</h3>
        <span className="event-count">{events.length}</span>
      </div>

      <div className="events-container">
        {events.length === 0 ? (
          <p className="no-events">Connect to receive live market updates...</p>
        ) : (
          events.map((event, index) => (
            <Event
              key={`${event.timestamp}-${event.id || index}`}
              event={event}
              isNew={index === 0 && events.length > prevEventsLengthRef.current}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EventsFeed;
