"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../page.module.css";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import EventPopup from "../ProfileEventPopup"; // note: parent folder
import ProfileCard from "../../components/profile/ProfileCard";
import TabBar from "../../components/navbar/TabBar";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

/** ----- helpers copied from /profile-page/page.js ----- */
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
  const rawDate = e.Date ?? e.date ?? null;
  const rawStart = e.startTime ?? null;
  const dateOnly = parseDateOnly(rawDate);
  if (!dateOnly) return Number.POSITIVE_INFINITY;
  const tm = parseTimeHM(rawStart) || { h: 0, m: 0 };
  const composed = new Date(
    dateOnly.getFullYear(),
    dateOnly.getMonth(),
    dateOnly.getDate(),
    tm.h, tm.m, 0, 0
  );
  return composed.getTime();
}
/** ----------------------------------------------------- */

export default function PublicProfile({ params }) {
  const { id } = params; // organizer id from URL
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      try {
        // 1) Events are publicly available by ownerId (your route)
        const evRes = await fetch(`${API_BASE}/api/loadEvents/byOwner/${id}`);
        if (!evRes.ok) throw new Error(`Events fetch failed: ${evRes.status}`);
        const evJson = await evRes.json();
        const events = Array.isArray(evJson?.events) ? evJson.events : evJson; // your route sometimes returns {events}
        if (isMounted) setOrgEvents(events ?? []);

        // 2) Try to fetch public profile info for this id (adjust to your real route)
        // If you already have one like /users/profile/:id or /users/public/:id, use it here.
        // If not, we’ll fall back to whatever is populated on eventOwner.
        let clubData = null;
        try {
          const profileRes = await fetch(`${API_BASE}/users/profile/${id}`);
          if (profileRes.ok) {
            const data = await profileRes.json();
            clubData = data?.club || data?.user || data;
          }
        } catch (_) {}

        if (!clubData) {
          // Fallback from populated eventOwner (make sure backend populates desired fields)
          const owner =
            (events && events[0] && events[0].eventOwner) ? events[0].eventOwner : null;
          if (owner && typeof owner === "object") {
            clubData = {
              _id: owner._id,
              name: owner.name ?? "Organizer",
              bio: owner.bio ?? "",
              profilePic: owner.profilePic ?? "",
            };
          } else {
            clubData = { _id: id, name: "Organizer", bio: "", profilePic: "" };
          }
        }

        if (isMounted) setClub(clubData);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setClub({ _id: id, name: "Organizer", bio: "", profilePic: "" });
          setOrgEvents([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAll();
    return () => { isMounted = false; };
  }, [id]);

  const sortedEvents = useMemo(() => {
    return [...orgEvents].sort((a, b) => eventStartTimestamp(a) - eventStartTimestamp(b));
  }, [orgEvents]);

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard
          name={club?.name}
          bio={club?.bio}
          profilePic={club?.profilePic}
          onEdit={() => router.push("/profile-page/edit")} // edit remains for current user
          isOwner={false} // visiting someone else’s profile
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
