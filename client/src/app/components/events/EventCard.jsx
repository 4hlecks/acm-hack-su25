"use client"

import React, { forwardRef } from "react";
import EventTag from "./EventTag";
import styles from './EventCard.module.css'

const EventCard = forwardRef(function EventCard({ event }, ref) {
    // Event should contain the following metadata
    const {
        eventCover, eventName, eventOwner,
        eventDate, eventTime, eventLocation,
        eventDescription, eventTags, eventSrc
    } = event;

    return (
        <article className={styles.card} ref={ref}>
            <div className={styles.cover}>
                <img src={eventCover} alt={`${eventName} Cover Image`}/>
            </div>
            <section className={styles.info}>
                <div className={styles.tags}>
                    {eventTags?.slice(0,3).map((tag, index) => {
                        return <EventTag key={index} label={tag} />;
                    })}
                </div>
                <h3 className={styles.name}>{eventName}</h3>
                <p className={styles.owner}>{eventOwner}</p>
                <div className={styles.wrapper}>
                    <time className={styles.date}>{eventDate}</time>
                    <span className={styles.location}>{eventLocation}</span>
                </div>
            </section>
        </article>
    )
});

export default EventCard;