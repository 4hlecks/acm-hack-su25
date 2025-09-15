"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../page.module.css";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import EventPopup from "@/app/components/events/EventPopup";
import ProfileCard from "../../components/profile/ProfileCard";
import TabBar from "../../components/navbar/TabBar";
import { useRouter } from "next/navigation";
import { use } from 'react';
import { usePopup } from "@/app/context/PopupContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

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

export default  function PublicProfile({ params }) {
  const { id } =  use(params);
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const {selectedEvent, openEventPopup, isPopupOpen, closeEventPopup} = usePopup();

  useEffect(() => {
      const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        const res = await fetch(`${API_BASE}/users/profile/me`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        
        if (res.ok) {
          const profileData = await res.json();
          console.log("Profile data:", profileData);
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
    }
    fetchCurrentUser();
  }, []);


  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      try {
        const evRes = await fetch(`${API_BASE}/api/loadEvents/byOwner/${id}`);
        if (!evRes.ok) throw new Error(`Events fetch failed: ${evRes.status}`);
        const evJson = await evRes.json();
        const events = Array.isArray(evJson?.events) ? evJson.events : evJson; 
        if (isMounted) setOrgEvents(events ?? []);

        let clubData = null;
        try {
          const profileRes = await fetch(`${API_BASE}/users/profile/${id}`);
          if (profileRes.ok) {
            const data = await profileRes.json();
            clubData = data?.club || data?.user || data;
          }
        } catch (_) {}

        if (!clubData) {
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

  const handleEventClick = (event) =>{
    openEventPopup(event);
  }

  if (loading) {
    return (
    <div className={styles.loadingContainer}>
      <div>Loading…</div>
    </div>
    )
  };
    
  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard
          name={club?.name}
          bio={club?.bio}
          profilePic={club?.profilePic}
          onEdit={() => router.push("/profile-page/edit")} 
          isOwner={false} // visiting profile u dont own
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
                onClick={() => handleEventClick(event)}
                style={{ cursor: "pointer" }}
              >
                <EventCard event={event} />
              </div>
            ))
          )}
        </section>
        {isPopupOpen && (
          <EventPopup event={selectedEvent}
          onClose={closeEventPopup}
          isOpen={isPopupOpen}
          clubId={currentUser?._id}
          userRole={currentUserRole}
          />
        )}
      </main>
      <TabBar />
    </>
  );
}
