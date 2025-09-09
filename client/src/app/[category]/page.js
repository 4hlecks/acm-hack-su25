"use client"

import {useParams, useRouter} from 'next/navigation';
import {useState, useEffect} from 'react';
import EventCard from '../components/events/EventCard';
import styles from './CategoryEvents.module.css'
import { ArrowLeft } from "react-feather";
import NavBar from '../components/NavBar'

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
                const response = await fetch(`http://localhost:5000/api/loadEvents/${categoryDisplayName}`);
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
        <>
            <NavBar />
            <div className={styles.container}>
                <header className={styles.header}>
                    {/* Main title */}
                    <h1 className={styles.title}>Discover Events</h1>
                    
                    {/* Category section with back button */}
                    <div className={styles.categorySection}>
                        <button onClick={handleBackClick} className={styles.backButton}>
                            <ArrowLeft className={styles.backIcon} />
                            {categoryDisplayName}
                        </button>
                    </div>
                </header>
                {events.length > 0 ? (
                    <div className={styles.eventsGrid}>     
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    </div>
                ) : (
                    <div className={styles.noEvents}>
                        <p>No {categoryDisplayName} events found.</p>
                    </div>
                )}
            </div>
        </>
    );
}