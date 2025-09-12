"use client"
import React, { useEffect, useState } from 'react';
import styles from './page.module.css'
import NavBar from './components/navbar/NavBar'
import TabBar from './components/navbar/TabBar'
import EventCarousel from './components/events/EventCarousel'
import EventPopup from './components/events/EventPopup'

export default function Home() {
  const [eventsByCategory, setEventsByCategory] = useState({});

  {/*Different categories for events! */}
   const categories = [
    "Fundraiser",
    "Free Food", 
    "GBM",
    "Game Night",
    "Networking",
    "Panel",
    "Social",
    "Study Jam",
    "Workshop"
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      const newEventsByCategory = {};
      
      for (const category of categories) {
        try {
          const response = await fetch(`http://localhost:5000/api/loadEvents/category/${category}`);
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

  //Check to see if popup is open
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openEventPopup = (event) => {
    console.log('Opening popup with event:', event); 
    setSelectedEvent(event);
    setIsPopupOpen(true);
  };

  const closeEventPopup = () => {
    setSelectedEvent(null);
    setIsPopupOpen(false);
  };

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <h1 className={styles.pageTitle}>Home</h1>
          {categories.filter(category => eventsByCategory[category]?.length > 0).map(category => (
            <EventCarousel
              key={category}
              category={category}
              events = {eventsByCategory[category] || []}
              onEventClick={openEventPopup} 
            /> 
          ))}
      </main>
      
      {isPopupOpen && (
      <EventPopup event={selectedEvent} onClose={closeEventPopup} isOpen={isPopupOpen} />)}
      <TabBar />
    </>
  );
}