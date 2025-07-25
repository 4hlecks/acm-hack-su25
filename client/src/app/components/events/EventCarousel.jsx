"use client"

import React, { useState, useRef, useEffect } from "react";
import EventCard from "./EventCard";
import styles from './EventCarousel.module.css'

const EventCarousel = ({ category, categorySrc, events }) => {
    const containerRef = useRef(null); // Ref to visible window of the carousel
    const cardRef = useRef(null); // Ref to single event card to measure width
    const [cardsPerWindow, setCardsPerWindow] = useState(1); // Number of cards in current window view
    const [currentWindow, setCurrentWindow] = useState(0); // Current visible cards
    const totalWindows = Math.ceil(events.length / cardsPerWindow); // Total windows or "pages" of cards

    useEffect(() => {
        const updateCardsPerWindow = () => {
            if (containerRef.current && cardRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const cardWidth = cardRef.current.offsetWidth;
                const numCards = Math.floor(containerWidth / cardWidth);
                setCardsPerWindow(Math.max(1, numCards)); // Always show at least 1 card
            }
        };

        updateCardsPerWindow();
        window.addEventListener("resize", updateCardsPerWindow); // Recalculate after window resize
        return () => window.removeEventListener("resize", updateCardsPerWindow); // Cleanup
    }, []);

    const handlePrev = () => {
        setCurrentWindow((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setCurrentWindow((prev) => Math.min(prev + 1, totalWindows - 1));
    };

    
    return (
        <section className={styles.carouselSection}>
            <header>
                <h2 style={{ fontSize: '32px' }}>{category}</h2>
                <p className="carousel-see-all">See All</p>
            </header>
            <div className={styles.content}>
                <button className={styles.navButton} onClick={handlePrev}>L</button>
                <div className="carousel-track-window">
                    <div
                        className="carousel-track"
                        style={{
                            transform: `translateX(-${currentWindow * 100}%)`,
                            transition: "transform 0.5s ease-in-out",
                            width: `${(events.length / cardsPerWindow) * 100}%`,
                            display: "flex",
                        }}
                    >
                        {events.map((event, index) => (
                            <EventCard
                                event={event}
                                key={event.id}
                                ref={index === 0 ? cardRef : null}
                            />
                        ))}
                    </div>
                </div>
                <button className={styles.navButton} onClick={handleNext}>R</button>
            </div>
        </section>
    )
}

export default EventCarousel;