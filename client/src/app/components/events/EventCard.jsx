import React from "react";
import EventTag from "./EventTag";
import styles from './events.css'

const EventCard = ({ event }) => {
    // event should contain the following metadata
    const { coverImage, name, organization, date, time, location, description, tags } = event;

    return (
        <article className="event-card">
            <div className="image-wrapper">
                <img src={coverImage} alt={`${name} Cover Image`} className="event-cover" />
            </div>

            <div className="tags-wrapper">
                {tags?.slice(0,3).map((tag, index) => {
                    return <EventTag key={index} label={tag} />;
                })}
            </div>

            <hgroup className="metadata-wrapper">
                <h3>{name}</h3>
                <p>{organization}</p>
                <p>{date} {location}</p>
            </hgroup>
        </article>
    )
}

export default EventCard;