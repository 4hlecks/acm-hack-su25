"use client"

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowRight } from "react-feather";
import EventCard from "./EventCard";
import "swiper/css";
import styles from './EventCarousel.module.css'

const EventCarousel = ({ category, events }) => {
    return (
        <section className={styles.carouselSection}>
            <header className={styles.carouselHeader}>
                <h2 className={styles.carouselTitle}>{category}</h2>
                <p className={styles.carouselSeeAll}>See All <ArrowRight className={styles.carouselSeeAllIcon}/></p>
            </header>
            <div className={styles.carouselContent}>
                <button className="carousel-left" id={styles.carouselLeft}><ChevronLeft className={styles.carouselLeftIcon}/></button>
                <Swiper
                    slidesPerView={"auto"}
                    slidesPerGroup={5}
                    spaceBetween={16}
                    navigation={{
                        nextEl: ".carousel-right",
                        prevEl: ".carousel-left",
                    }}
                    modules={[Navigation]}
                    className={styles.carouselSwiper}
                >
                    {events.map((event, index) => (
                        <SwiperSlide key={index} className={styles.carouselCard}>
                            <EventCard event={event} />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <button className="carousel-right" id={styles.carouselRight}><ChevronRight className={styles.carouselRightIcon}/></button>
            </div>
                
        </section>
    )
}

export default EventCarousel;