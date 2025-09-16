'use client';
import { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, add, sub } from 'date-fns';
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

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}
    >
      <div>
        <button
          onClick={() => onNavigate('PREV')}
          style={{
            marginRight: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: '#001f3f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          ‹ Prev
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          style={{
            marginRight: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: '#F0B323',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          style={{
            padding: '0.4rem 0.8rem',
            background: '#001f3f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Next ›
        </button>
      </div>
      <h2 style={{ margin: 0, color: '#001f3f' }}>{label}</h2>
      <select
        value={view}
        onChange={(e) => onView(e.target.value)}
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
  );
}

export default function CalendarPage() {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const token = localStorage.getItem('accessToken');
        const type = localStorage.getItem('accountType');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        setAccountType(type);

        if (!userId || !token) return;

        let url =
          type === 'student'
            ? `http://localhost:5001/api/users/${userId}/saved-events`
            : 'http://localhost:5001/events/byOwner/me';

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

  const handleNavigate = (action) => {
    if (action === 'TODAY') {
      setDate(new Date());
    } else if (action === 'PREV') {
      if (view === Views.MONTH) setDate(sub(date, { months: 1 }));
      if (view === Views.WEEK) setDate(sub(date, { weeks: 1 }));
      if (view === Views.DAY) setDate(sub(date, { days: 1 }));
    } else if (action === 'NEXT') {
      if (view === Views.MONTH) setDate(add(date, { months: 1 }));
      if (view === Views.WEEK) setDate(add(date, { weeks: 1 }));
      if (view === Views.DAY) setDate(add(date, { days: 1 }));
    }
  };

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
        <h1
          style={{
            textAlign: 'center',
            margin: '0.6rem 0',
            color: '#001f3f',
          }}
        >
          {accountType === 'student' ? 'My Saved Events' : 'My Club’s Events'}
        </h1>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: '#F0B323',
            borderRadius: '10px',
            padding: '12px',
            margin: '0 1rem 1rem',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              height: '100%',
              padding: '1rem',
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView={Views.MONTH}
              view={view}
              date={date}
              onView={setView}
              onNavigate={() => {}}
              style={{ height: '100%' }}
              components={{
                event: CustomEvent,
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    onNavigate={handleNavigate}
                    onView={setView}
                    view={view}
                  />
                ),
              }}
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
