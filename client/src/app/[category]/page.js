"use client"

import {useParams, useRouter} from 'next/navigation';
import {useState, useEffect} from 'react';
import EventCard from '../components/events/EventCard';
import styles from './CategoryEvents.module.css'
import { ArrowLeft } from "react-feather";

export default function CategoryEvensPage() {
    const params = useParams();
    const router = useRouter();
    const category = params.category;

    const categoryDisplayName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const [events, setEvents] = useState([]);
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryEvents = async () => {
            try{
                const response = await fetch(`/api/loadEvents/${categoryDisplayName}`);
                const data = await response.json();
                setEvents(data);
            } catch (error){
                console.error('Error fetching events', error);
            } finally{
                setLoading(false);
            }
        }
        if (category){
            fetchCategoryEvents();
        }
    }, [categoryDisplayName])

    if (loading){
        return <div className={styles.loading}>Loading events...</div>
    }

    const handleBackClick = () => {
        router.back(); //go back to previous page
    }

    return(
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button onClick={handleBackClick} className={styles.backButton}>
                        <ArrowLeft className={styles.backIcon} />
                        {categoryDisplayName}
                    </button>
                </div>
                <div className={styles.searchSection}>
                    <h1 className={styles.title}>Discover Events</h1>
                    <div className={styles.searchContainer}>
                        <input type="text" placeHolder="Search events..." className={styles.searchInput}></input>
                    </div>
                </div>
            </header>

            <div className={styles.eventsGrid}>
                {events.length > 0 ? (
                    events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))
                ) : (
                    <div className={styles.noEvents}>
                        <p>No {categoryDisplayName} events found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}