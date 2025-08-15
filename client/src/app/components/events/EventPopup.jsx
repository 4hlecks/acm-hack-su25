"use client"

import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { Calendar, MapPin, X } from "react-feather";
import { Dialog } from '@base-ui-components/react/dialog';
import styles from './EventPopup.module.css';


const EventPopup = ({ event, onClose, isOpen }) => {
    const [mounted, setMounted] = useState(false);

    //Check if appears on screen
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!event || !mounted) return null;


    const {
        coverPhoto, eventTitle, eventOwner,
        eventDate, startTime, endTime, eventLocation,
        eventDescription, tags, eventSrc
    } = event;

    function formatDisplayDateTime(){
        const [year, month, day] = eventDate.split('-');
        const date = new Date(year, month - 1, day);
        
        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
        return `${formattedDate} | ${startTime} - ${endTime}`;
    }

    const dialogContent = (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal container={document.body}>
                <Dialog.Backdrop className={styles.backdrop} />
                <Dialog.Popup className={styles.popup}>
                    {/* Close button */}
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>

                    {/* Popup content */}
                    <div className={styles.content}>
                        {/* Event image */}
                        <div className={styles.imageSection}>
                            <img src={coverPhoto} alt="Event cover" className={styles.eventImage}/>          
                        </div>  
                        {/*Event details*/}                
                        <div className={styles.rightPanel}>

                            <div className={styles.detailsSection}>
                                <div className={styles.clubInfo}>
                                    <img src="/Images/acm.png" alt="Club logo" className={styles.clubLogo}></img>
                                    <p className={styles.owner}>
                                    {eventOwner}
                                    </p>
                                </div>                                                            
                                <Dialog.Title className={styles.title}>
                                    {eventTitle}                                    
                                </Dialog.Title>
                                <div className={styles.infoContainer}>
                                    <div className={styles.infoItem}>
                                        <MapPin size={16} className={styles.infoIcon} />
                                        <span>{eventLocation}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Calendar size={16} className={styles.infoIcon} />
                                        <span>{formatDisplayDateTime()}</span>
                                    </div>
                                </div>                              
                                <Dialog.Description className={styles.description}>
                                    {eventDescription}
                                </Dialog.Description>                               
                            </div>
                            <div className={styles.buttonContainer}>          
                                    <button onClick={onClose} className={styles.saveButton}>
                                        Save Event
                                    </button>                               
                            </div>
                        </div>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );

    // Use React Portal to render to document.body
    return createPortal(dialogContent, document.body);
};

export default EventPopup;