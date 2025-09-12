"use client"
import React, { useEffect, useState, useSession } from "react";
import { createPortal } from 'react-dom';
import { Clock, Calendar, MapPin, X } from "react-feather";
import { Dialog } from '@base-ui-components/react/dialog'; 
import styles from './EventPopup.module.css';

const EventPopup = ({ event, onClose, isOpen }) => {
    const [mounted, setMounted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, [event, isOpen]);

    useEffect(() => {
        if (event && isOpen){
            checkIfEventSaved()
        }
    })

    if (!mounted || !event || !isOpen) return null;

    const {
        coverPhoto, eventTitle, eventOwner,
        startDate, endDate, startTime, endTime, eventLocation, 
        eventDescription, tags
    } = event;

    const checkIfEventSaved = async() => {
        try {
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user') || {});
            const userId = user.id;

            const response = await fetch(`http://localhost:5000/api/users/${userId}/saved-events`, {
                headers:{
                    'Authorization': `Bearer${token}`,
                    'Content-Type': 'application/json'
                }
            });

            //Get the saved events array
            const savedEvents = await response.json();

            //Check if current event is in that array
            const isEventSaved = savedEvents?.some(savedEvent => 
                savedEvent._id === event._id || savedEvent === event._id
            );
            setIsSaved(isEventSaved);
        } catch (error) {
            console.error('Error checking if event is saved:', error);
        }
    }
    
    const handleSaveEvent = async() => {
        try{
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;
            
            const method = isSaved ? 'DELETE' : 'POST';
            
            const response = await fetch(`http://localhost:5000/api/users/${userId}/saved-events/${event._id}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok){
                setIsSaved(!isSaved); 
                console.log('Even saved successfully')
            } else{
                console.error('Error saving event')
            }
        } catch (error){
            console.error('Network error:', error)
        }
    }

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
                    {/* Popup Content */}
                    <article className={styles.eventContent}>
                        {/* Mobile Query Club Bar */}
                        <div className={styles.clubInfoMobile}>
                            {eventOwner?.profilePic ? (
                                    <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
                            ) : (
                                <canvas className={styles.clubLogo}></canvas>
                            )}
                            <h3 className={styles.clubOwner}>
                                    {eventOwner?.name || eventOwner || 'Unknown Organizer'}
                            </h3>
                            <button onClick={onClose} className={styles.closeButton}>
                                <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
                            </button>
                        </div>

                        {/* Event Image Cover */}
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
                                {eventOwner?.profilePic ? (
                                    <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
                                ) : (
                                    <canvas className={styles.clubLogo}></canvas>
                                )}
                                <h3 className={styles.clubOwner}>
                                    {eventOwner?.name || eventOwner || 'Unknown Organizer'}
                                </h3>
                                <button onClick={onClose} className={styles.closeButton}>
                                    <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
                                </button>
                            </div>
                            <div className={styles.eventInfo}>
                                {/* Title */}
                                <Dialog.Title className={styles.eventTitle}>{eventTitle}</Dialog.Title>

                                {/* Location */}
                                <section className={styles.eventDetail}>
                                    <MapPin className={styles.eventIcon} />
                                    <span className={styles.eventDetailText}>{eventLocation || 'Location TBD'}</span>
                                </section>

                                {/* Date */}
                                <section className={styles.eventDetail}>
                                    <Calendar className={styles.eventIcon} />
                                    <span className={styles.eventDetailText}>{formatDisplayDate()}</span>
                                </section>

                                {/* Time */}
                                <section className={styles.eventDetail}>
                                    <Clock className={styles.eventIcon} />
                                    <span className={styles.eventDetailText}>{formatTimeRange() || 'Time TBD'}</span>
                                </section>

                                {/* Description */}
                                <Dialog.Description className={styles.eventDescription}>
                                    {eventDescription || 'No description available.'}
                                </Dialog.Description>
                            </div>                              

                            <div className={styles.buttonContainer}>          
                                <button onClick={handleSaveEvent} className={styles.saveButton}>
                                    {isSaved ? 'Remove from Saved' : 'Save Event'}
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