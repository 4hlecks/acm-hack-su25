"use client";

import React, { useEffect, useState } from "react";
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
  const base = src.startsWith?.("/uploads") ? `${API_BASE}${src}` : src;
  const ver = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${ver}`;
}

export default function Profile() {
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState({ upcoming: [], past: [] });
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
          cache: "no-store",
        }),
        fetch(`${API_BASE}/api/loadEvents/byOwner/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);

      if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
      if (!eventsRes.ok) throw new Error(`Events fetch failed: ${eventsRes.status}`);

      const profileData = await profileRes.json();
      const data = await eventsRes.json();

      console.log("EventsRes JSON:", data); // 👀 debug what backend sends

      setClub(profileData.club);

      // Handle both shapes: {upcomingEvents, pastEvents} OR {events}
      setOrgEvents({
        upcoming: Array.isArray(data.upcomingEvents)
          ? data.upcomingEvents
          : Array.isArray(data.events)
          ? data.events
          : [],
        past: Array.isArray(data.pastEvents) ? data.pastEvents : [],
      });
    } catch (err) {
      console.error(err);
      setOrgEvents({ upcoming: [], past: [] });
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
          clubId={club?._id}
        />

        {/* Upcoming Events */}
        <div className={styles.eventsHeader}>
          <h2><strong>Upcoming Events</strong></h2>
        </div>
        <section className={styles.eventGrid}>
          {orgEvents.upcoming.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            orgEvents.upcoming.map((event) => (
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

        {/* Past Events */}
        <div className={styles.eventsHeader} style={{ marginTop: "2rem" }}>
        <h2>
          <strong>
            Past Events <span className={styles.subtext}>(Last 30 days)</span>
          </strong>
        </h2>
        </div>

        <section className={styles.eventGrid}>
          {orgEvents.past.length === 0 ? (
            <p>No recent past events.</p>
          ) : (
            orgEvents.past.map((event) => (
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