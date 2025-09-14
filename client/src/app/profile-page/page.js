"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import NavBar from "../components/navbar/NavBar";
import EventCard from "../components/events/EventCard";
import EventPopup from "./ProfileEventPopup";
import ProfileCard from "../components/profile/ProfileCard";
import TabBar from "../components/navbar/TabBar";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

function normalizedPic(src, updatedAt) {
     if (!src) return "";
     const base =
       src.startsWith?.("/uploads") ? `${API_BASE}${src}` : src;
     // Add a stable, content-derived version (updatedAt) so browser refetches after edits
     const ver = updatedAt ? new Date(updatedAt).getTime() : Date.now();
     const sep = base.includes("?") ? "&" : "?";
     return `${base}${sep}v=${ver}`;
   }

function parseDateOnly(raw) {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function parseTimeHM(raw) {
  if (!raw) return null;

  if (raw.includes("T")) {
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) return { h: dt.getHours(), m: dt.getMinutes() };
  }

  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const mer = ampm[3].toUpperCase();
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return { h, m };
  }

  const hhmm = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    const h = parseInt(hhmm[1], 10);
    const m = parseInt(hhmm[2], 10);
    if (!isNaN(h) && !isNaN(m)) return { h, m };
  }

  return null;
}

function eventStartTimestamp(e) {
  const rawDate = e.date || e.Date;   // normalize
  if (!rawDate) return Number.POSITIVE_INFINITY;

  const baseDate = new Date(rawDate);
  if (isNaN(baseDate.getTime())) return Number.POSITIVE_INFINITY;

  // default to midnight
  let h = 0, m = 0;

  if (e.startTime) {
    const time = e.startTime.includes("T")
      ? new Date(e.startTime)
      : new Date(`1970-01-01T${e.startTime}`);
    if (!isNaN(time.getTime())) {
      h = time.getHours();
      m = time.getMinutes();
    }
  }

  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    h,
    m,
    0,
    0
  ).getTime();
}


  
export default function Profile() {
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = async () => {
       const token = localStorage.getItem("token");
       if (!token) {
         router.push("/login");
         return;
       }
       try {
         const [profileRes, eventsRes] = await Promise.all([
           fetch(`${API_BASE}/users/profile/me`, {
             headers: { Authorization: `Bearer ${token}` },
             // CHANGED: ensure browser doesn't cache this request
             cache: "no-store",
           }),
           fetch(`${API_BASE}/api/loadEvents/byOwner/me`, {
             headers: { Authorization: `Bearer ${token}` },
             cache: "no-store", // CHANGED
           }),
         ]);
    
         if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
         if (!eventsRes.ok) throw new Error(`Events fetch failed: ${eventsRes.status}`);
    
         const profileData = await profileRes.json();
         const { events } = await eventsRes.json();
    
         setClub(profileData.club);
         setOrgEvents(Array.isArray(events) ? events : []);
       } catch (err) {
         console.error(err);
         setOrgEvents([]);
       } finally {
         setLoading(false);
       }
     };

  useEffect(() => {
    fetchData();
  }, [router]);

  useEffect(() => {
       const onFocus = () => fetchData();
       window.addEventListener("focus", onFocus);
       return () => window.removeEventListener("focus", onFocus);
     }, []);

  const sortedEvents = useMemo(() => {
    return [...orgEvents].sort((a, b) => {
      const ta = eventStartTimestamp(a);
      const tb = eventStartTimestamp(b);
      return ta - tb; 
    });
  }, [orgEvents]);

  const handleEdit = () => {
    router.push("/profile-page/edit");
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard
          name={club?.name}
          bio={club?.bio}
          profilePic={normalizedPic(club?.profilePic, club?.updatedAt)}
          onEdit={handleEdit}
          isOwner={true}
        />

        <div className={styles.eventsHeader}>
          <h2><strong>Events</strong></h2>
        </div>

        <section className={styles.eventGrid}>
          {sortedEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                style={{ cursor: "pointer" }}
              >
                <EventCard event={event} />
              </div>
            ))
          )}
        </section>


        {selectedEvent && (
          <EventPopup
            event={selectedEvent}
            clubId={club?._id}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </main>
      <TabBar />
    </>
  );
}
