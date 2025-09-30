"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import EventCard from "../components/events/EventCard";
import EventPopup from "./ProfileEventPopup";
import ProfileCard from "../components/profile/NewProfileCard";
import NavItem from "../components/navbar/NavItem"; // adjust import path
import Spacer from "@/components/form/Spacer";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

function normalizedPic(src, updatedAt) {
  if (!src) return "";
  const base = src.startsWith?.("/uploads") ? `${API_BASE}${src}` : src;
  const ver = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${ver}`;
}

export default function ProfilePage() {
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // local tab state: 'upcoming' | 'past'
  const [tab, setTab] = useState("upcoming");

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

      setClub(profileData.club);

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

  const handleEdit = () => router.push("/profile-page/edit");

  if (loading) return <div className={styles.loading}>Loading…</div>;

  const list = tab === "upcoming" ? orgEvents.upcoming : orgEvents.past;

  return (
    <main className={styles.page}>
      {/* Main constrained container to simplify responsive control */}
      <div className={styles.container}>
        {/* Profile Header */}
        <section className={styles.profileHeader} aria-labelledby="club-header">
          <ProfileCard
            name={club?.name}
            bio={club?.bio}
            profilePic={normalizedPic(club?.profilePic, club?.updatedAt)}
            onEdit={handleEdit}
            isOwner={true}
            clubId={club?._id}
          />
        </section>
        

        {/* Profile Content */}
        <section
          aria-labelledby={tab === "upcoming" ? "upcoming-title" : "past-title"}
          className={styles.profileContent}
        >
            {/* Tabs */}
            <nav role="tablist" className={styles.tabs}>
            <NavItem
                type="button"
                label="Upcoming Events"
                action={() => setTab('upcoming')}
                role="tab"
                aria-selected={tab === 'upcoming'}
                data-variant="pageTab"
                active={tab === 'upcoming'}           // <-- important
            />
            <NavItem
                type="button"
                label="Past Events"
                action={() => setTab('past')}
                role="tab"
                aria-selected={tab === 'past'}
                data-variant="pageTab"
                active={tab === 'past'}               // <-- important
            />
            </nav>

            {/* Event Grids */}
            <div className={styles.eventGrid}>
                {list.length === 0 ? (
                <p className={styles.empty}>
                    {tab === "upcoming" ? "No upcoming events." : "No events from the last 30 days."}
                </p>
                ) : (
                list.map((event) => (
                    <article
                    key={event._id}
                    className={styles.eventCell}
                    onClick={() => setSelectedEvent(event)}
                    aria-label={event.title || "Event"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedEvent(event);
                    }}
                    >
                    <EventCard event={event} />
                    </article>
                ))
                )}
            </div>
        </section>
      </div>

      {selectedEvent && (
        <EventPopup
          event={selectedEvent}
          clubId={club?._id}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  );
}