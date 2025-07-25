"use client"

import React, { useState } from "react";
import EventCard from "./EventCard";
import styles from './events.css'

const EventCarousel = ({ category, categorySrc, events }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalEvents = events.length;

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
          (prevIndex - 1 + totalEvents) % totalEvents
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalEvents);
    };

    
    return (
        <section className="carousel-section">
            <header>
                <h2>{category}</h2>
                <p className="carousel-see-all">See All</p>
            </header>
            <div className="carousel-content">
                <button onClick={handlePrev}>Previous</button>
                <div className="carousel-events-window">
                    <EventCard event={events[currentIndex]} />
                </div>
                <button onClick={handleNext}>Next</button>
            </div>
        </section>
    )
}

export default EventCarousel;