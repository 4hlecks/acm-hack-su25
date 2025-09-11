"use client"

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import NavBar from '../components/navbar/NavBar';
import EventCard from '../components/events/EventCard';
import ProfileCard from '../components/profile/ProfileCard';
import TabBar from '../components/navbar/TabBar';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

export default function Profile() {
  const router = useRouter();

  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  //const organizationId = "YOUR_ORG_ID"; Replace with actual org ID

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Get the signed-in club’s profile
        const res = await fetch(`${API_BASE}/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
        const data = await res.json();
        setClub(data.club);

        if (data.club?._id) {
          try {
            const evRes = await fetch(`${API_BASE}/api/events/byClub/${data.club._id}`);
            if (evRes.ok) {
              const events = await evRes.json();
              setOrgEvents(Array.isArray(events) ? events : events.events || []);
            }
          } catch {
            setOrgEvents([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEdit = () => {
    router.push('/profile_page/edit'); 
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <ProfileCard 
          name={club?.name}
          handle={club?.email?.split('@')[0]}  
          bio={club?.bio}
          profilePic={club?.profilePic}
          onEdit={handleEdit}
          isOwner={true}
        />

        <div className={styles.eventsHeader}>
          <h2><strong>Events</strong></h2>
        </div>

        <section className={styles.eventGrid}>
          {orgEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            orgEvents.map((event) => <EventCard key={event._id} event={event} />)
          )}
        </section>
      </main>
      <TabBar />
    </>
  );
}