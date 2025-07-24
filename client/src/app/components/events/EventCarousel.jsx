"use client";

import React, { useRef, useState, useEffect } from "react";
import EventCard from "./EventCard";
import styles from './events.css'

const CARDS_PER_PAGE = 7; // Amount of cards currently visible
const CARD_WIDTH = 200;

const EventCarousel = ({ title, events }) => {
    const [scrollAmount, setScrollAmount] = useState(0);
    const trackRef = useRef();

    const totalCards = events.length;
    const totalScrollWidth = totalCards * CARD_WIDTH;
    const visibleWidth = CARDS_PER_PAGE * CARD_WIDTH;
    const maxScrollAmount = totalScrollWidth - visibleWidth;

    const handleNext = () => {
        const remaining = maxScrollAmount - scrollAmount;

        // If enough space for a full jump of 7 cards
        if (remaining >= visibleWidth) {
            setScrollAmount(scrollAmount + visibleWidth);
        } else if (remaining > 0) {
            // If fewer than 7 remain, scoot to remainder
            setScrollAmount(scrollAmount + remaining);
        }
    };

    const handlePrev = () => {
        const newScroll = scrollAmount - visibleWidth;
        setScrollAmount(Math.max(0, newScroll));
    };

    return (
        <section className="carousel-section">
            <hgroup className="carousel-title">
                <h2>{title}</h2>
                <p>See All</p>
            </hgroup>
            <div className="carousel-window">
                <div
                    className="carousel-track"
                    ref={trackRef}
                    style={{
                        transform: `translateX(-${scrollAmount}px)`,
                    }}
                >
                {events.map((event, index) => (
                    <div key={event.id || index} className="carousel-card">
                    <EventCard event={event} />
                    </div>
                ))}
                </div>
            </div>

        <button className="carousel-btn left" onClick={handlePrev} disabled={scrollAmount <= 0}>
            ◀
        </button>
        <button className="carousel-btn right" onClick={handleNext} disabled={scrollAmount >= maxScrollAmount}>
            ▶
        </button>
        </section>
    )
}

export default EventCarousel;