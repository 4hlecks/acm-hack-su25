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

export default function Profile() {
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/users/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/loadEvents/byOwner/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
    
        if (!profileRes.ok)
          throw new Error(`Profile fetch failed: ${profileRes.status}`);
        if (!eventsRes.ok)
          throw new Error(`Events fetch failed: ${eventsRes.status}`);
    
        const profileData = await profileRes.json();
        const { events } = await eventsRes.json();
    
        const sortedEvents = (events || []).sort(
          (a, b) => new Date(b.Date) - new Date(a.Date)
        );
    
        setClub(profileData.club);
        setOrgEvents(sortedEvents);
      } catch (err) {
        console.error(err);
        setOrgEvents([]);
      } finally {
        setLoading(false);
      }
    };
    

    fetchData();
  }, [router]);

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
          profilePic={club?.profilePic}
          onEdit={handleEdit}
          isOwner={true}
        />

        <div className={styles.eventsHeader}>
          <h2>
            <strong>Events</strong>
          </h2>
        </div>

        <section className={styles.eventGrid}>
          {orgEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            orgEvents.map((event) => (
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

        {/* 🔑 Popup modal */}
        {selectedEvent && (
          <EventPopup
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </main>
      <TabBar />
    </>
  );
}
