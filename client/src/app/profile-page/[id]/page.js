"use client";

import React, { useEffect, useState, use } from "react";
import styles from "../page.module.css";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import EventPopup from "@/app/components/events/EventPopup";
import ProfileCard from "../../components/profile/ProfileCard";
import TabBar from "../../components/navbar/TabBar";
import { useRouter } from "next/navigation";
import { usePopup } from "@/app/context/PopupContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function PublicProfile({ params }) {
  const { id } = use(params);

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState({ upcoming: [], past: [] });
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
        // fetch profile
        const profileRes = await fetch(`${API_BASE}/users/profile/${id}`);
        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
        const profileData = await profileRes.json();
        if (isMounted) setClub(profileData.club);

        // fetch events (both upcoming and past)
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
    return () => { isMounted = false; };
  }, [id]);


  if (loading) {
    return (
    <div className={styles.loadingContainer}>
      <div>Loading…</div>
    </div>
    )
  };

  const handleEventClick = (event) =>{
    openEventPopup(event);
  }
    
  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard
          name={club?.name}
          bio={club?.bio}
          profilePic={club?.profilePic}
          isOwner={false}
          clubId={club?._id} // visiting profile you don't own
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
                onClick={() => handleEventClick(event)}
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
              Past Events <span style={{ fontSize: "0.8em", color: "#666" }}>(Last 30 days)</span>
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
