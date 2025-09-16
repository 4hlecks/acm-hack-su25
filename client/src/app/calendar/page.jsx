'use client';
import { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

function CustomEvent({ event }) {
  const startTime = event.start.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <span>
      {startTime} – <strong>{event.title}</strong>
    </span>
  );
}

export default function CalendarPage() {
  const [view, setView] = useState(Views.MONTH);
  const [events, setEvents] = useState([]);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const token = localStorage.getItem('accessToken');
        const type = localStorage.getItem('accountType');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setAccountType(type);


        if (!token) {
          console.error('No token found, cannot fetch events');
          return;
        }

        let url;
        if (type === 'student') {
          if (!user.id) return;
          url = `http://localhost:5000/api/users/${user.id}/saved-events`;
        } else {
          url = 'http://localhost:5000/events/byOwner/me';
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        const rawEvents = Array.isArray(data) ? data : data.events || [];

        const formatted = rawEvents.map((ev) => {
          const start = new Date(ev.Date);
          const end = new Date(ev.Date);
          end.setHours(start.getHours() + 1);
          return {
            title: ev.eventTitle,
            start,
            end,
          };
        });

        formatted.sort((a, b) => a.start - b.start);
        setEvents(formatted);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    }

    fetchEvents();
  }, []);

  const HEADER_H = 40;

  return (
    <div
      style={{
        height: '100vh',
        background: '#FFFFFF',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_H,
          background: '#001f3f',
          zIndex: 1000,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: HEADER_H,
          overflow: 'hidden',
        }}
      >
        <h1 style={{ textAlign: 'center', margin: '0.6rem 0', color: '#001f3f' }}>
          {accountType === 'student' ? 'My Saved Events' : 'My Club’s Events'}
        </h1>

        <div style={{ margin: '0 1rem 0.6rem', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>View:</label>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              border: '1px solid #F0B323',
              fontSize: '1rem',
              backgroundColor: '#FFFFFF',
              color: '#001f3f',
            }}
          >
            <option value={Views.MONTH}>Month</option>
            <option value={Views.WEEK}>Week</option>
            <option value={Views.DAY}>Day</option>
          </select>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: '#F0B323',
            borderRadius: '10px',
            padding: '12px',
            margin: '0 1rem 1rem',
          }}
        >
          <div style={{ background: '#FFFFFF', borderRadius: '8px', height: '100%' }}>
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
              components={{ event: CustomEvent }}
              popup
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .rbc-event {
          background-color: #F0B323 !important;
          color: #000 !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 4px 6px !important;
          font-size: 0.9rem !important;
          white-space: normal !important;
          line-height: 1.2em !important;
        }
        .rbc-event:hover {
          background-color: #ffcc4d !important;
        }
      `}</style>
    </div>
  );
}
