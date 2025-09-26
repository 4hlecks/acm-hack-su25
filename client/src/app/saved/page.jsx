"use client"
import React, { useEffect, useState } from "react";
import NavBar from "../components/navbar/NavBar";
import EventCard from "../components/events/EventCard";
import styles from '../page.module.css'; 
import { usePopup } from "../context/PopupContext";
import EventPopup from "../components/events/EventPopup";
import {useRouter} from 'next/navigation';

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { selectedEvent, isPopupOpen, closeEventPopup } = usePopup();
  const router = useRouter();
  
  const fetchSavedEvents = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      router.push("/login");
      return;
    }
    
    //Get the user's unique string
    const user = JSON.parse(userString);
    
    const userId = user.id || user._id; 

    if (!userId){
      return;
    }

    try {
      const profileResponse = await fetch(`http://localhost:5001/users/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const currentUser = profileData.user || profileData.club;
          setUser(currentUser);
          setUserRole(profileData.user ? "user" : "club");
        }
      
      const response = await fetch(`http://localhost:5001/users/${userId}/saved-events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Error response:', response.status);
        return;
      }

      const data = await response.json();
      const validEvents = data.filter(event => event && event._id);
      setSavedEvents(validEvents);
    } catch (error) {
      console.error('Error fetching saved events:', error);
    }
  };

  useEffect(() => {
    fetchSavedEvents();
  }, [])
  
  useEffect(() => {
    if (!isPopupOpen){
      fetchSavedEvents();
    }
  }, [isPopupOpen])


  return (
    <>
      <NavBar />
      <main style={{ padding: "2rem", marginTop: "80px" }}>
        <h1 className={styles.pageTitle}>Saved Events</h1>
        <section style={{ 
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          marginLeft: "2%",
          marginBottom: "1rem",
          marginTop: "2rem"
        }}>
          {savedEvents.length === 0 ? (
            <p>No saved events found.</p>
          ) : (
            savedEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </section>
      </main>
      {isPopupOpen && (
        <EventPopup
          event={selectedEvent}
          onClose={closeEventPopup}
          isOpen={isPopupOpen}
          clubId={user?._id}
          userRole={userRole}
        />
      )}
    </>
  );
}