"use client";

import React, { use, useEffect, useState } from "react";
import styles from "../page.module.css";

import EventCard from "../../components/events/EventCard";
import EventPopup from "@/app/(public)/components/events/EventPopup";
import ProfileCard from "../../components/profile/ProfileCard";
import NavItem from "../../components/navbar/NavItem";
import { usePopup } from "@/app/(public)/context/PopupContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

// normalize image src + cache-busting
function normalizedPic(src, updatedAt) {
  if (!src) return "";
  const base = src.startsWith?.("/uploads") ? `${API_BASE}${src}` : src;
  const ver = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${ver}`;
}

export default function PublicProfile({ params }) {
  const { id } = use(params);

  // data
  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  // current viewer (for popup props)
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // tabs
  const [tab, setTab] = useState("upcoming");

  // popup (public variant uses context)
  const { selectedEvent, openEventPopup, isPopupOpen, closeEventPopup } = usePopup();

  // fetch viewer (optional, preserved from your original)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profileData = await res.json();
          if (profileData.club) {
            setCurrentUser(profileData.club);
            setCurrentUserRole("club");
          } else if (profileData.user) {
            setCurrentUser(profileData.user);
            setCurrentUserRole("user");
          }
        }
      } catch (err) {
        console.error("Error fetching current user profile:", err);
        setCurrentUser(null);
        setCurrentUserRole(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // fetch public club + events
  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      try {
        const profileRes = await fetch(`${API_BASE}/users/profile/${id}`);
        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
        const profileData = await profileRes.json();
        if (isMounted) setClub(profileData.club);

        const evRes = await fetch(`${API_BASE}/api/loadEvents/byClub/${id}`);
        if (!evRes.ok) throw new Error(`Events fetch failed: ${evRes.status}`);
        const { upcomingEvents, pastEvents } = await evRes.json();
        if (isMounted) {
          setOrgEvents({
            upcoming: Array.isArray(upcomingEvents) ? upcomingEvents : [],
            past: Array.isArray(pastEvents) ? pastEvents : [],
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setClub({ _id: id, name: "Organizer", bio: "", profilePic: "" });
          setOrgEvents({ upcoming: [], past: [] });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading…
      </div>
    );
  }

  const list = tab === "upcoming" ? orgEvents.upcoming : orgEvents.past;

  const handleEventClick = (event) => openEventPopup(event);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Profile header spans the same width as the event grid */}
        <section className={styles.profileHeader} aria-labelledby="club-header">
          <ProfileCard
            name={club?.name}
            bio={club?.bio}
            profilePic={normalizedPic(club?.profilePic, club?.updatedAt)}
            isOwner={false}           // public view
            clubId={club?._id}
          />
        </section>

        {/* Profile content: tabs + grid */}
        <section
          aria-labelledby={tab === "upcoming" ? "upcoming-title" : "past-title"}
          className={styles.profileContent}
        >
          {/* Tabs */}
          <nav role="tablist" className={styles.tabs}>
            <NavItem
              type="button"
              label="Upcoming Events"
              action={() => setTab("upcoming")}
              role="tab"
              aria-selected={tab === "upcoming"}
              data-variant="pageTab"
              active={tab === "upcoming"}
            />
            <NavItem
              type="button"
              label="Past Events"
              action={() => setTab("past")}
              role="tab"
              aria-selected={tab === "past"}
              data-variant="pageTab"
              active={tab === "past"}
            />
          </nav>

          {/* Grid (shares same CSS as your new page) */}
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
                  onClick={() => handleEventClick(event)}
                  aria-label={event.title || "Event"}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleEventClick(event);
                  }}
                >
                  <EventCard event={event} />
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Public Event Popup via context (unchanged behavior) */}
      {isPopupOpen && (
        <EventPopup
          event={selectedEvent}
          onClose={closeEventPopup}
          isOpen={isPopupOpen}
          clubId={currentUser?._id}
          userRole={currentUserRole}
        />
      )}
    </main>
  );
}
