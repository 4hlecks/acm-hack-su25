"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Calendar, MapPin, X } from "react-feather";
import { Dialog } from "@base-ui-components/react/dialog";
import styles from "./EventPopup.module.css";
import Link from "next/link";
import {useRouter} from 'next/navigation';

const EventPopup = ({ event, onClose, isOpen, clubId, userRole }) => {
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [event, isOpen]);

const checkIfEventSaved = async() => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const response = await fetch(`http://localhost:5001/users/${userId}/saved-events`, {
          headers:{
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      //Get the saved events array
      if (response.ok){
        const savedEvents = await response.json();
        const isEventSaved = savedEvents?.some(savedEvent => 
        savedEvent._id === event._id || savedEvent === event._id
        );
        setIsSaved(isEventSaved);
      } else{
        return;
      }
      
      //Check if current event is in that array
      
    } catch (error) {
        console.error('Error checking if event is saved:', error);
    }
  }
  useEffect(() => {
    if (event && isOpen){
        checkIfEventSaved()
    }
  } , [event, isOpen])



  if (!mounted || !event || !isOpen) return null;
  

  const {
    coverPhoto,
    eventTitle,
    eventOwner,
    date,
    Date: DateLegacy,
    startTime,
    endTime,
    eventLocation,
    eventDescription,
  } = event;

  const isOwner = String(eventOwner?._id || eventOwner) === String(clubId);
  const ownerId = eventOwner?._id || eventOwner;

  const profileHref = isOwner
    ? "/profile-page"
    : `/profile-page/${ownerId}`;

  // Debug log
  console.log("DEBUG EventPopup ownership check", {
    eventOwner,
    eventOwnerId: eventOwner?._id || eventOwner,
    clubId,
    userRole,
    isOwner,
    profileHref,
  });

  

  const handleSaveEvent = async() => {
    try{
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const method = isSaved ? 'DELETE' : 'POST';

      const response = await fetch(`http://localhost:5001/users/${userId}/saved-events/${event._id}`, {
          method: method,
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (response.ok){
        setIsSaved(!isSaved); 
        console.log('Event saved successfully')
      } else{
        console.error('Error saving event')
      }
    } catch (error){
      console.error('Network error:', error)
    }
  }

  function formatDisplayDate(dateValue) {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Date TBD";
    return d.toLocaleDateString("en-US", {
      timezone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return "Time TBD";
    const options = { hour: "numeric", minute: "2-digit", hour12: true };

    const startDate = new Date(
      startTime.includes("T") ? startTime : `1970-01-01T${startTime}`
    );
    let endDate = new Date(
      endTime.includes("T") ? endTime : `1970-01-01T${endTime}`
    );

    if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
    }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "Time TBD";

    const startStr = startDate.toLocaleTimeString([], options);
    const endStr = endDate.toLocaleTimeString([], options);
    const startAMPM = startStr.split(" ").pop();
    const endAMPM = endStr.split(" ").pop();

    return startAMPM === endAMPM
      ? `${startStr.replace(" " + startAMPM, "")} - ${endStr}`
      : `${startStr} - ${endStr}`;
  }

  const displayDate = formatDisplayDate(date || DateLegacy);
  const displayTime = formatTimeRange(startTime, endTime);

  const dialogContent = (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={document.body}>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <article className={styles.eventContent}>
            {/* Mobile header */}
            <div className={styles.clubInfoMobile}>
              {eventOwner?.profilePic ? (
                <Link href={profileHref}> 
                  <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
                </Link>
              ) : (
                <Link href={profileHref}> 
                  <canvas className={styles.clubLogo}></canvas>
                </Link>
              )}
              <h3 className={styles.clubOwner}>
                <Link href={profileHref}> 
                  {eventOwner?.name || eventOwner || "Unknown Organizer"}
                </Link>
              </h3>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
              </button>
            </div>

            {/* Flyer */}
            <figure className={styles.imageSection}>
              <img
                src={
                  coverPhoto && coverPhoto.trim() !== ""
                    ? coverPhoto
                    : "/images/ucsd-logo.png"
                }
                alt="Event Flyer"
                className={styles.eventImage}
                onError={(e) => {
                  e.currentTarget.src = "/images/image.png";
                }}
              />
            </figure>


            {/* Event info */}
            <section className={styles.eventSection}>
              <div className={styles.clubInfo}>
                {eventOwner?.profilePic ? (
                  <Link href={profileHref}> 
                    <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
                  </Link>
                ) : (
                  <Link href={profileHref}>
                    <canvas className={styles.clubLogo}></canvas>
                  </Link>
                )}
                <h3 className={styles.clubOwner}>
                  <Link href={profileHref}> 
                    {eventOwner?.name || eventOwner || "Unknown Organizer"}
                  </Link>
                </h3>
                <button onClick={onClose} className={styles.closeButton}>
                  <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
                </button>
              </div>

              <div className={styles.eventInfo}>
                <Dialog.Title className={styles.eventTitle}>{eventTitle}</Dialog.Title>

                <section className={styles.eventDetail}>
                  <MapPin className={styles.eventIcon} />
                  <span className={styles.eventDetailText}>
                    {eventLocation || "Location TBD"}
                  </span>
                </section>

                <section className={styles.eventDetail}>
                  <Calendar className={styles.eventIcon} />
                  <span className={styles.eventDetailText}>{displayDate}</span>
                </section>

                <section className={styles.eventDetail}>
                  <Clock className={styles.eventIcon} />
                  <span className={styles.eventDetailText}>{displayTime}</span>
                </section>

                <Dialog.Description className={styles.eventDescription}>
                  {eventDescription || "No description available."}
                </Dialog.Description>
              </div>


              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
              <div className={styles.tagList}>
              {event.tags.slice(0, 6).map((tag, i) => (
              <span
                key={i}
                className={`${styles.tag} ${styles[`tagColor${i % 6}`]}`}
              >
                {tag}
              </span>
              ))}
              </div>
              )}

              {/* Conditional buttons */}
              <div className={styles.buttonContainer}>
                {userRole === "club" && isOwner && (
                  <button
                    onClick={() =>
                      (window.location.href = `/profile-page/edit?eventId=${event._id}`)
                    }
                    className={styles.saveButton}
                  >
                    Edit Event
                  </button>
                )}
                {userRole === "user" && (
                  <button onClick={handleSaveEvent} className={styles.saveButton}>
                    {isSaved ? 'Remove from Saved' : 'Save Event'}
                  </button>                               
                )}
                {userRole === null  && (
                  <button onClick={() => router.push('/login')} className={styles.saveButton}>
                    Login to Save Event
                  </button>
                )}
              </div>
            </section>
          </article>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );

  return createPortal(dialogContent, document.body);
};

export default EventPopup;