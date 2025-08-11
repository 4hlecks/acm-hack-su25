"use client"

import React, { useEffect, useState } from 'react';
import styles from './page.module.css'
import NavBar from './components/NavBar'
import EventCard from './components/events/EventCard'
import ProfileCard from './components/profile/ProfileCard';

export default function Home() {
  const [eventsByCategory, setEventsByCategory] = useState({});

  const categories = ["Fundraiser", "Free Food", "GBM"];

  useEffect(() => {
    const fetchEvents = async () => {
      const newEventsByCategory = {};
      
      for (const category of categories) {
        try {
          const response = await fetch(`http://localhost:5000/api/loadEvents/${category}`);
          const data = await response.json();
          newEventsByCategory[category] = data;
        } catch (error) {
          console.error(`Error fetching events for category ${category}:`, error);
          newEventsByCategory[category] = [];
        }
      }
      setEventsByCategory(newEventsByCategory);
    };
    fetchEvents();
  }, []);

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard />
        <div className={styles.eventsHeader}>
          <h2>Events</h2>
          <select className={styles.sortDropdown}>
            <option>Sort by</option>
            <option value="gbm">GBM</option>
            <option value="fundraiser">Fundraiser</option>
            <option value="free-food">Free Food</option>
          </select>
        </div>
        <section className={styles.eventGrid}>
          {freeFoodEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      </main>
    </>
  );
}
