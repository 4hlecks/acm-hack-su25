"use client"
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import EventCard from "../components/events/EventCard";
import styles from '../page.module.css'; 

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState([]);
  const myId = "YOUR_USER_OR_ORG_ID"; // Replace with your actual user/org ID

  useEffect(() => {
    const fetchSavedEvents = async () => {
      // Adjust the endpoint to match backend for saved events
      const response = await fetch(`http://localhost:5000/api/users/${myId}/saved-events`);
      const data = await response.json();
      setSavedEvents(data); 
    };
    fetchSavedEvents();
  }, []);

  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", marginTop: "80px" }}>
        <h1 className={styles.pageTitle}>Saved Events</h1>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          {savedEvents.length === 0 ? (
            <p>No saved events found.</p>
          ) : (
            savedEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </section>
      </main>
    </>
  );
}