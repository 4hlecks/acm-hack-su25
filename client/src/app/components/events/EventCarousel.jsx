import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from 'next/link';
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowRight } from "react-feather";
import EventCard from "./EventCard";
import "swiper/css";
import styles from './EventCarousel.module.css'

const EventCarousel = ({ category, events = [] }) => {
    const categoryID = category.replace(/\s+/g, "-").toLowerCase(); // e.g. "free-food"
    return (
        <section className={styles.carouselSection}>
            <header className={styles.carouselHeader}>
                <h2 className={styles.carouselTitle}>{category}</h2>

                {/*Link to the See All Page */}
                <Link href={`/${categoryID}`} className={styles.carouselSeeAll}>See All <ArrowRight className={styles.carouselSeeAllIcon}/></Link> 
                
            </header>
            <div className={styles.carouselContent}>
                <button className={styles.carouselLeft} id={`carousel-left-${categoryID}`}><ChevronLeft className={styles.carouselLeftIcon}/></button>
                <Swiper
                    slidesPerView={"auto"}
                    slidesPerGroup={5}
                    spaceBetween={16}
                    navigation={{
                        nextEl: `#carousel-right-${categoryID}`,
                        prevEl: `#carousel-left-${categoryID}`,
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
                <button className={styles.carouselRight} id={`carousel-right-${categoryID}`}><ChevronRight className={styles.carouselRightIcon}/></button>
            </div>
                
        </section>
    )
}

export default EventCarousel;