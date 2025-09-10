import React from "react";
import { Calendar, MapPin } from "react-feather";
import styles from './EventCard.module.css';

const EventCard = ({ event, onEventClick } ) => {
    // Event should contain the following metadata
    const {
        coverPhoto, eventTitle, eventOwner,          
        startDate, endDate, startTime, endTime, eventLocation, 
        tags      
    } = event;

    function formatDisplayDate(){
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())){
            return 'Date TBD';
        }

        //check if same day
        const isSameDay = start.toDateString() === end.toDateString();

        if (isSameDay){
            return start.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
            });
        } else{
            const startFormatted = start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            })

            const endFormatted = end.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            })

            return `${startFormatted} - ${endFormatted}`
        } 
    }

    function formatTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return '';

        const [startHourMin, startAMPM] = startTime.split(' ');
        const [endHourMin, endAMPM] = endTime.split(' ');

        if (startAMPM === endAMPM) {
            return `${startHourMin}-${endHourMin} ${startAMPM}`;
        } else {
            return `${startHourMin} ${startAMPM} - ${endHourMin} ${endAMPM}`;
        }
    }

    const displayDate = formatDisplayDate();
    const displayTime = formatTimeRange(startTime, endTime);


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
                <img className={styles.eventCoverImage} src={coverPhoto} alt={`${eventTitle} Cover Image`} 
                onError={(e) => {
                    console.log('Image failed to load:');
                    e.target.src = 'https://res.cloudinary.com/dl6v3drqo/image/upload/v1755808273/ucsandiego_pxvdhh.png'
                }}/>
            </div>
            <section className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{eventTitle}</h3>
                <p className={styles.eventOwner}>{eventOwner?.name}</p>
                <span className={styles.eventLocation}>
                    <MapPin className={styles.eventLocationIcon}/> 
                    <span className={styles.eventLocationText}>{eventLocation}</span>
                </span>
                <time className={styles.eventDate}>
                    <Calendar className={styles.eventDateIcon}/> 
                    <div className={styles.dateTimeContainer}>
                        <div className={styles.dateText}>{displayDate}</div>
                        {displayTime && <div className={styles.timeText}>{displayTime}</div>}
                    </div>
                </time>
            </section>
        </article>
    )
};

export default EventCard;