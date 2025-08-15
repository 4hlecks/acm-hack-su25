import React from "react";
import { Calendar, MapPin } from "react-feather";
import styles from './EventCard.module.css';

const EventCard = ({ event, onEventClick } ) => {
    // Event should contain the following metadata
    const {
        coverPhoto, eventTitle, eventOwner,          
        eventDate, startTime, eventLocation, 
        tags, eventSrc      
    } = event;

    function formatDisplayDateTime(){
        const [year, month, day] = eventDate.split('-');
        const date = new Date(year, month - 1, day);
        
        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
        
        return `${formattedDate} ${startTime}`;
        
    }

    const dateTimeInfo = formatDisplayDateTime();

    //calls the parent component 
    function handleClick() {
        console.log('EventCard clicked!', eventTitle);
        onEventClick(event);
    }

    return (
        <article className={styles.eventCard}
                 onClick={handleClick} 
        >
            <div className={styles.eventCover}>
                <img className={styles.eventCoverImage} src={coverPhoto} alt={`${eventTitle} Cover Image`}/>
            </div>
            <section className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{eventTitle}</h3>
                <p className={styles.eventOwner}>{eventOwner}</p>
                <span className={styles.eventLocation}>
                    <MapPin className={styles.eventLocationIcon}/> 
                    <span className={styles.eventLocationText}>{eventLocation}</span>
                </span>
                <time className={styles.eventDate}>
                    <Calendar className={styles.eventDateIcon}/> 
                    <div className={styles.dateTimeContainer}>
                        {dateTimeInfo}
                    </div>
                </time>
            </section>
        </article>
    )
};

export default EventCard;