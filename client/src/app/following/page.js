"use client"

import {useRouter} from 'next/navigation';
import { useState, useEffect } from 'react';
import EventCard from '../components/events/EventCard';
import styles from './FollowingEvents.module.css'; 
import { ArrowLeft } from "react-feather";
import NavBar from '../components/navbar/NavBar';
import EventPopup from '../components/events/EventPopup';
import { usePopup } from '../context/PopupContext';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function FollowingPage(){    
    const router = useRouter();
    const {selectedEvent, isPopupOpen, closeEventPopup} = usePopup();

    const [followingClubs, setFollowingClubs] = useState([]);
    const [clubEvents, setClubsEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const[userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchFollowingAccounts = async() => {
            const token = localStorage.getItem('token');
            if (!token){
                setLoading(false);
                return;
            }

            try {
                //Get user profile
                const response = await fetch (`${API_BASE}/users/profile/me`, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                if (!response.ok){
                    setLoading(false);
                    return;
                }

                const profileData = await response.json();
                const currentUser = profileData.user || profileData.club;
                setUser(currentUser);
                setUserRole(profileData.user ? "user": "club");

                //Get following list
                const followingResults = await fetch(`${API_BASE}/users/${currentUser._id}/following`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (!followingResults.ok){
                    setLoading(false);
                    return;
                }

                const followingList = await followingResults.json();
                setFollowingClubs(followingList);

                //Fetch events for each followed club
                const eventsPromises = followingList.map(async (club) => {
                    try {
                        const eventsRes = await fetch(`${API_BASE}/api/loadEvents/byClub/${club._id}`);
                        if (eventsRes.ok){
                            const eventsData = await eventsRes.json();
                            return {
                                clubId: club._id,
                                events: eventsData.upcomingEvents || []
                            };
                        }
                        return {clubId: club._id, events: []};
                    } catch (error){
                        console.error(`Error fetching events for club ${club._id}:`, error);
                        return {clubId: club._id, events: []};
                    }
                });

                const eventsResults = await Promise.all(eventsPromises);
                const eventsMap = {};
                eventsResults.forEach(result => {
                    eventsMap[result.clubId] = result.events;
                })

                setClubsEvents(eventsMap);
            } catch (error){
                console.error('Error fetching following data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFollowingAccounts();
    }, []);

    if (loading){
        return <div className={styles.loading}>Loading followed clubs and events... </div>;
    }

    const handleBackClick = () => {
        router.back();
    }

    //Filter clubs that have upcoming events and sort events by date
    const clubsWithEvents = followingClubs.filter(club => clubEvents[club._id] && clubEvents[club._id].length > 0)
        .map(club => ({
            ...club, 
            events: clubEvents[club._id].sort((a, b) => new Date (a.date) - new Date(b.date))
        }
    ))

    return(
        <>
            <NavBar/>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Following</h1>
                    <div className={styles.categorySection}>
                        <button onClick={handleBackClick} className={styles.backButton}>
                            <ArrowLeft className={styles.backIcon} />
                            Back
                        </button>
                    </div>
                </header>
                {followingClubs.length === 0 ? (
                    <div className={styles.noEvents}>
                        <p>You're not following any clubs yet.</p>
                    </div>
                ) : clubsWithEvents.length === 0 ? ( 
                    <div className={styles.noEvents}>
                        <p>No upcoming events from clubs you're following.</p>
                    </div>
                    ) : (
                    <div className={styles.clubsContainer}>
                        {clubsWithEvents.map(club => {
                            // Determine if this is the current user's own profile
                            const isOwner = user && user._id === club._id;
                            const profileHref = isOwner ? "/profile-page" : `/profile-page/${club._id}`;
                            
                            return (
                                <div key={club._id} className={styles.clubSection}>
                                    <div className={styles.clubHeader}>
                                        <div className={styles.clubInfo}>
                                            {club.profilePic ? (
                                                <Link href={profileHref}>
                                                    <img src={club.profilePic} alt={club.name} className={styles.clubAvatar}/>
                                                </Link>
                                            ) : (
                                                <Link href={profileHref}>
                                                    <div className={styles.clubAvatar}></div>
                                                </Link>
                                            )}
                                            <h2 className={styles.clubName}>
                                                <Link href={profileHref}>
                                                    {club.name}
                                                </Link>
                                            </h2>
                                        </div>
                                        <span className={styles.eventCount}>
                                            {club.events.length} upcoming event{club.events.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className={styles.eventsGrid}>
                                        {club.events.map((event, index) => (
                                            <EventCard 
                                                key={event.id || index} 
                                                event={event}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
    )
}   