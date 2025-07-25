"use client"

import React from "react";
import EventTag from "./EventTag";
import styles from './EventCard.module.css'

const EventCard = ({ event }) => {
    // Event should contain the following metadata
    const { eventCover, eventName, eventOwner,
            eventDate, eventTime, eventLocation,
            eventDescription, eventTags, eventSrc } = event;

    return (
        <article className="event-card">
            <div className="event-cover">
                <img src={eventCover} alt={`${eventName} Cover Image`}/>
            </div>

            <div className="event-tags">
                {eventTags?.slice(0,3).map((tag, index) => {
                    return <EventTag key={index} label={tag} />;
                })}
            </div>

            <section className="event-info">
                <h3 className="event-name">{eventName}</h3>
                <p className="event-owner">{eventOwner}</p>
                <div>
                    <time className="event-date">{eventDate}</time>
                    <span className="event-location">{eventLocation}</span>
                </div>
            </section>
        </article>
    )
}

export default EventCard;