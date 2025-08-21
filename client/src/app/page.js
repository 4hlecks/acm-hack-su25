"use client"

import React, { useEffect, useState } from 'react';
import styles from './page.module.css'
import NavBar from './components/navbar/NavBar'
import MobileNavBar from './components/navbar/MobileNavBar'
import EventCarousel from './components/events/EventCarousel'

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
        <h1 className={styles.pageTitle}>Home</h1>
          {categories.map(category => (
            <EventCarousel
              key={category}
              category={category}
              events={eventsByCategory[category] || []}
            /> 
          ))}
      </main>
      <MobileNavBar />
    </>
  );
}
