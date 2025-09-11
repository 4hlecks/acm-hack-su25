"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, Calendar, MapPin, X } from "react-feather";
import { Dialog } from "@base-ui-components/react/dialog";
import styles from "./ProfileEventPopup.module.css";

const ProfileEventPopup = ({ event, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !event) return null;

  const {
    coverPhoto,
    eventTitle,
    eventOwner,
    date,
    Date: DateLegacy, // fallback if mismatch
    startTime,
    endTime,
    eventLocation,
    eventDescription,
  } = event;

  function formatDisplayDate(value) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "Date TBD";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatTimeRange(start, end) {
    if (!start || !end) return "Time TBD";
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    const startDate = new Date(start.includes("T") ? start : `1970-01-01T${start}`);
    const endDate = new Date(end.includes("T") ? end : `1970-01-01T${end}`);
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
    <Dialog.Root open={!!event} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={document.body}>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <article className={styles.eventContent}>
            <div className={styles.clubInfoMobile}>
              {eventOwner?.profilePic ? (
                <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
              ) : (
                <canvas className={styles.clubLogo}></canvas>
              )}
              <h3 className={styles.clubOwner}>
                {eventOwner?.name || eventOwner || "Unknown Organizer"}
              </h3>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
              </button>
            </div>

            <figure className={styles.imageSection}>
              <img
                src={coverPhoto}
                alt="Event Flyer"
                className={styles.eventImage}
                onError={(e) => {
                  e.target.src =
                    "https://res.cloudinary.com/dl6v3drqo/image/upload/v1755808273/ucsandiego_pxvdhh.png";
                }}
              />
            </figure>

            <section className={styles.eventSection}>
              <div className={styles.clubInfo}>
                {eventOwner?.profilePic ? (
                  <img src={eventOwner.profilePic} alt="Club Logo" className={styles.clubLogo} />
                ) : (
                  <canvas className={styles.clubLogo}></canvas>
                )}
                <h3 className={styles.clubOwner}>
                  {eventOwner?.name || eventOwner || "Unknown Organizer"}
                </h3>
                <button onClick={onClose} className={styles.closeButton}>
                  <X size={25} strokeWidth={2.5} className={styles.closeButtonIcon} />
                </button>
              </div>

              <div className={styles.eventInfo}>
                <Dialog.Title className={styles.eventTitle}>{eventTitle}</Dialog.Title>

                <section className={styles.eventDetail}>
                  <MapPin className={styles.eventIcon} />
                  <span className={styles.eventDetailText}>{eventLocation || "Location TBD"}</span>
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

  return createPortal(dialogContent, document.body);
};

export default ProfileEventPopup;
