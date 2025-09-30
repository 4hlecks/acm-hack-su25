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
  const endTime = event.end.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <span>
       <strong>{event.title}</strong>
    </span>
  );
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr', // equal thirds
        alignItems: 'center',
        marginBottom: '1rem',
      }}
    >
      {/* Left controls */}
      <div style={{ justifySelf: 'start' }}>
        <button onClick={() => onNavigate('PREV')} style={navButtonStyle}>‹ Prev</button>
        <button onClick={() => onNavigate('TODAY')} style={todayButtonStyle}>Today</button>
        <button onClick={() => onNavigate('NEXT')} style={navButtonStyle}>Next ›</button>
      </div>

      {/* Centered label */}
      <h2
        style={{
          margin: 0,
          color: '#001f3f',
          textAlign: 'center',
          justifySelf: 'center', // lock to middle column
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
        }}
      >
        {label}
      </h2>

      {/* Right select */}
      <div style={{ justifySelf: 'end' }}>
        <select
          value={view}
          onChange={(e) => onView(e.target.value)}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #F0B323',
            fontSize: '0.9rem',
            backgroundColor: '#FFFFFF',
            color: '#001f3f',
            cursor: 'pointer',
            minWidth: '80px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            outline: 'none'
          }}
        >
          <option value={Views.MONTH}>Month</option>
          <option value={Views.WEEK}>Week</option>
          <option value={Views.DAY}>Day</option>
        </select>
      </div>
    </div>
  );
}

const navButtonStyle = {
  marginRight: '0.5rem',
  padding: '0.4rem 0.8rem',
  background: '#001f3f',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const todayButtonStyle = {
  marginRight: '0.5rem',
  padding: '0.4rem 0.8rem',
  background: '#F0B323',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

    

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
export default function CalendarPage() {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [accountType, setAccountType] = useState(null);
  const [currentView, setCurrentView] = useState('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const type = user.role;
        const userId = user.id;
        setAccountType(type);

        if (!userId || !token) return;

        let allEvents = [];

        //Fetch saved events for users
        if (currentView === 'all'){
          const allEventsRes = await fetch(`${API_BASE}/api/loadEvents/all`);
          if (allEventsRes.ok){
            const allEventsData = await allEventsRes.json();
            allEvents = [...allEvents, ...(allEventsData.events || [])];
          }
        }

        if (type === 'user' && (currentView === 'saved' || currentView ==='all')){
          const savedRes  = await fetch(`${API_BASE}/users/${userId}/saved-events`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (savedRes.ok){
            const savedData = await savedRes.json();
            allEvents = [...allEvents, ...savedData];
          }
        }

        //Fetch following events for users
        if (type === 'user' && (currentView === 'following' || currentView === 'all')){
          const followingRes = await fetch(`${API_BASE}/users/${userId}/following`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (followingRes.ok){
            const followingData = await followingRes.json();
            for (const club of followingData){
              const clubEventsRes = await fetch(`${API_BASE}/api/loadEvents/byClub/${club._id}`);
              if (clubEventsRes.ok){
                const clubEvents = await clubEventsRes.json();
                allEvents = [...allEvents, ...(clubEvents.upcomingEvents || []), ...(clubEvents.pastEvents || [])];
              }
            }
          }
        }

        //For clubs, fetch their own events
        if (type === 'club'){
          const res = await fetch(`${API_BASE}/api/loadEvents/byOwner/me`, {
            headers:{
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          })

          if (res.ok){
            const data = await res.json();
            allEvents = [...(data.upcomingEvents || []), ...(data.pastEvents || [])];
          }
        }

        //Remove duplicates
        const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e._id === event._id));
        

        const formatted = uniqueEvents.map((ev) => {
  
          const eventDate = new Date(ev.date);
          console.log('Parsed eventDate:', eventDate);
          
          // Create date string manually to avoid timezone issues
          const year = eventDate.getFullYear();
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          console.log('Final dateStr:', dateStr);
          
          const start = new Date(`${dateStr}T${ev.startTime}:00`);
          let end = new Date(`${dateStr}T${ev.endTime}:00`);
          
          if (ev.endTime < ev.startTime){
            end.setDate(end.getDate() + 1);
          }

          console.log('Calendar start/end:', start, end);

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
  }, [currentView]);

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

  return (
    <>
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
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            margin: '0.5rem 0 1rem',
            color: '#001f3f',
            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
            fontWeight: 700
          }}
        >
          {accountType === 'user' ? currentView === 'saved' ? 'My Saved Events' : currentView === 'following' ? 'Upcoming Events from Following' : 'All  Events' : "My Club's Events"}
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          margin: '0.5rem 0'
          }}>
        <button
          onClick={() => setCurrentView('saved')}
          style={{
            padding: '0.4rem 0.8rem',
            background: currentView === 'saved' ? '#F0B323' : '#fff',
            color: currentView === 'saved' ? '#000' : '#001f3f',
            border: '1px solid #F0B323',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Saved Events
        </button>
        <button
          onClick={() => setCurrentView('following')}
          style={{
            padding: '0.4rem 0.8rem',
            background: currentView === 'following' ? '#F0B323' : '#fff',
            color: currentView === 'following' ? '#000' : '#001f3f',
            border: '1px solid #F0B323',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Following
        </button>
        <button
          onClick={() => setCurrentView('all')}
          style={{
            padding: '0.4rem 0.8rem',
            background: currentView === 'all' ? '#F0B323' : '#fff',
            color: currentView === 'all' ? '#000' : '#001f3f',
            border: '1px solid #F0B323',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          All Events
        </button>
      </div>

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
    </>
    
  );
}
