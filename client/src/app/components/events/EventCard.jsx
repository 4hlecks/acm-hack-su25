import React from "react";
import { Calendar, MapPin, Clock } from "react-feather";
import styles from './EventCard.module.css';

const EventCard = ({ event, onEventClick } ) => {
    // Event should contain the following metadata
    const {
        coverPhoto, eventTitle, eventOwner,          
        date, startTime, endTime, eventLocation, 
        tags      
    } = event;

    function formatDisplayDate(){
        const d = new Date(date || event.Date);

        if (isNaN(d.getTime())) {
            return 'Date TBD';
        }

        return d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    function formatTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return '';

        const [startHourMin, startAMPM] = startTime.split(' ');
        const [endHourMin, endAMPM] = endTime.split(' ');

        if (startAMPM === endAMPM) {
            return `${startHourMin} - ${endHourMin} ${startAMPM}`;
        } else {
            return `${startHourMin} ${startAMPM} - ${endHourMin} ${endAMPM}`;
        }
    }

    const displayDate = formatDisplayDate();
    const displayTime = formatTimeRange(startTime, endTime);


    //calls the parent component 
    function handleClick() {
        console.log('EventCard clicked!', eventTitle);
        if (onEventClick) onEventClick(event);
    }
    return (
        <article className={styles.eventCard}
                 onClick={handleClick} 
        >
            <div className={styles.eventCover}>
                <img className={styles.eventCoverImage} src={coverPhoto} alt={`${eventTitle} Cover Image`} 
                onError={(e) => {
                    console.log('Image failed to load:');
                    e.target.src = 'https://res.cloudinary.com/dl6v3drqo/image/upload/v1755808273/ucsandiego_pxvdhh.png'
                }}/>
            </div>
            <section className={styles.eventInfo}>
                <header className={styles.eventHeader}>
                    <h3 className={styles.eventTitle}>{eventTitle}</h3>
                    <p className={styles.eventOwner}>{eventOwner?.name}</p>
                </header>
                <div className={styles.eventDetails}>
                    <span className={styles.eventDetail}>
                        <MapPin className={styles.eventIcon}/> 
                        <span className={styles.eventDetailsText}>{eventLocation}</span>
                    </span>
                    <time className={styles.eventDetail}>
                        <Calendar className={styles.eventIcon}/> 
                        <span className={styles.eventDetailsText}>{displayDate}</span>
                    </time>
                    <time className={styles.eventDetail}>
                        <Clock className={styles.eventIcon}/>
                        <span className={styles.eventDetailsText}>{displayTime}</span>
                    </time>
                </div>
            </section>
        </article>
    )
};

export default EventCard;