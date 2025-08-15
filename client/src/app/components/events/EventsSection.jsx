import React from 'react';
import './EventsSection.css';

const events = [
  // Example event data; in a real app, this would come from props or an API
  { id: 1, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
  { id: 2, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
  { id: 3, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
  { id: 4, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
  { id: 5, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
  { id: 6, title: "Event Title", org: "ACM", date: "Date & Location", tags: ["Tech", "In-Person"] },
];

function EventsSection() {
  return (
    <section className="events-section">
      <div className="events-header">
        <h2>Events</h2>
        <button className="sort-btn">Sort By ▼</button>
      </div>
      <div className="events-grid">
        {events.map(event => (
          <div className="event-card" key={event.id}>
            <div className="event-img-placeholder">
              <span className="plus-icon">＋</span>
              <img src="https://via.placeholder.com/60x40?text= " alt="Event" />
            </div>
            <div className="event-info">
              <div className="event-title">{event.title}</div>
              <div className="event-org">{event.org}</div>
              <div className="event-date">{event.date}</div>
              <div className="event-tags">
                {event.tags.map(tag => (
                  <span className="event-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventsSection;
