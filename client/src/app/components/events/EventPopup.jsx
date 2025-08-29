"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { Calendar, MapPin, X } from "react-feather";
import { Dialog } from '@base-ui-components/react/dialog'; 
import styles from './EventPopup.module.css';

const EventPopup = ({ event, onClose, isOpen }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !event || !isOpen) return null;

    const {
        coverPhoto, eventTitle, eventOwner,
        startDate, endDate, startTime, endTime, eventLocation, 
        eventDescription, tags
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
                weekday: "long",
                month: "long",
                day: "numeric"
            });
        } else{
            const startFormatted = start.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric"
            })

            const endFormatted = end.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric"
            })

            return `${startFormatted} - ${endFormatted}`
        } 
    }

    function formatTimeRange() {
        if (!startTime || !endTime) return '';

        
        const [startHourMin, startAMPM] = startTime.split(' ');
        const [endHourMin, endAMPM] = endTime.split(' ');

        if (startAMPM === endAMPM) {
            return `${startHourMin} - ${endHourMin} ${startAMPM}`;
        } else {
            return `${startHourMin} ${startAMPM} - ${endHourMin} ${endAMPM}`;
        }
    }

    

    const dialogContent = (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal container={document.body}>
                <Dialog.Backdrop className={styles.backdrop} />
                <Dialog.Popup className={styles.popup}>
                    {/* Close Button */}
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                    
                    {/* Popup Content */}
                    <article className={styles.eventContent}>
                        {/* Event Image */}
                        <figure className={styles.imageSection}>
                            <img 
                                src={coverPhoto} 
                                alt="Event Flyer" 
                                className={styles.eventImage}
                                onError={(e) => {
                                    console.log('Image failed to load in Event Popup');
                                    e.target.src = 'https://res.cloudinary.com/dl6v3drqo/image/upload/v1755808273/ucsandiego_pxvdhh.png'
                                }}
                            />          
                        </figure>  
                        
                        {/* Event Section */}                
                        <section className={styles.eventSection}>
                            <div className={styles.clubInfo}>
                                <img src={eventOwner?.profilePic} alt="Club Logo" className={styles.clubLogo}></img>
                                <h3 className={styles.clubOwner}>
                                    {eventOwner?.name || eventOwner || 'Unknown Organizer'}
                                </h3>
                            </div>
                            <div className={styles.eventInfo}>
                                <span className={styles.eventDate}>{formatDisplayDate()} | {formatTimeRange()}</span>
                                <Dialog.Title className={styles.eventTitle}>
                                    {eventTitle}                                    
                                </Dialog.Title>
                                <span className={styles.eventLocation}> <MapPin className={styles.eventIcon} /> {eventLocation || 'Location TBD'}</span>
                                <Dialog.Description className={styles.eventDescription}>
                                    {eventDescription || 'No description available.'}
                                </Dialog.Description>
                            </div>                              
                            <div className={styles.buttonContainer}>          
                                <button onClick={onClose} className={styles.saveButton}>
                                    Save Event
                                </button>                               
                            </div>
                        </section>
                    </article>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );

    // Use React Portal to render to document.body
    return createPortal(dialogContent, document.body);
};

export default EventPopup;