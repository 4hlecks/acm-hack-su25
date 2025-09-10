"use client"

import React, { useEffect, useState } from 'react';
import styles from './page.module.css'
import NavBar from '../components/navbar/NavBar'
import EventCard from '../components/events/EventCard'
import ProfileCard from '../components/profile/ProfileCard';
import TabBar from '../components/navbar/TabBar'

export default function Profile() {
  const [orgEvents, setOrgEvents] = useState([]);
  //const organizationId = "YOUR_ORG_ID"; Replace with actual org ID

  useEffect(() => {
    const fetchOrgEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/findClub/${organizationId}`);
        const data = await response.json();
        //setOrgEvents(data.events || []); if API returns events directly
      } catch (error) {
        console.error("Error fetching organization events:", error);
        setOrgEvents([]);
      }
    };
    fetchOrgEvents();
  }, []);

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard />
        <div className={styles.eventsHeader}>
          <h2>Events</h2>
        </div>
        <section className={styles.eventGrid}>
          {orgEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </section>
      </main>
      <TabBar />
    </>
  );
}