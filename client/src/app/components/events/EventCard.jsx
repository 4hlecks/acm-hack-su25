"use client"

import React from "react";
import { Calendar, MapPin } from "react-feather";
import styles from './EventCard.module.css';

const EventCard = ({ event }) => {
    // Event should contain the following metadata
    const {
        eventCover, eventTitle, eventOwner,
        eventDate, eventTime, eventLocation,
        eventDescription, eventTags, eventSrc
    } = event;

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const options = {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        };
        return date.toLocaleString("en-US", options).replace(",", "");
    }

    return (
        <article className={styles.eventCard}>
            <div className={styles.eventCover}>
                <img className={styles.eventCoverImage} src={eventCover} alt={`${eventTitle} Cover Image`}/>
            </div>
            <section className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{eventTitle}</h3>
                <p className={styles.eventOwner}>{eventOwner}</p>
                <span className={styles.eventLocation}><MapPin className={styles.eventLocationIcon}/> {eventLocation}</span>
                <time className={styles.eventDate}><Calendar className={styles.eventDateIcon}/> {formatDate(eventDate)}</time>
            </section>
        </article>
    )
};

export default EventCard;