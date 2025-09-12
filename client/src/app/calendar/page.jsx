'use client';
import { useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css'; 

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

// example events
const events = [
  {
    title: 'Hackathon kickoff',
    start: new Date(2025, 8, 20, 10, 0),
    end: new Date(2025, 8, 20, 12, 0),
  },
  {
    title: 'Club meeting',
    start: new Date(2025, 8, 21, 14, 0),
    end: new Date(2025, 8, 21, 15, 30),
  },
  {
    title: 'Project deadline',
    start: new Date(2025, 8, 25),
    end: new Date(2025, 8, 25),
    allDay: true,
  },
];

function CustomEvent({ event }) {
  const start = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <span>
      <strong>{event.title}</strong>
      {!event.allDay && (
        <span style={{ fontSize: '0.85em', color: '#555' }}> ({start} – {end})</span>
      )}
    </span>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState(Views.MONTH);

  return (
    <div style={{ height: '100vh', padding: '1rem', background: '#f5f5f5' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#001f3f' }}>
        Event Calendar
      </h1>

      {/* dropdown for selecting view */}
      <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
        <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>View:</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          style={{
            padding: '0.4rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        >
          <option value={Views.MONTH}>Month</option>
          <option value={Views.WEEK}>Week</option>
          <option value={Views.DAY}>Day</option>
        </select>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '1rem',
          height: '80vh',
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          view={view}
          onView={setView}
          style={{ height: '100%' }}
          toolbar={false}
          components={{
            event: CustomEvent,
          }}
        />
      </div>
    </div>
  );
}
