import React from "react";
import { Calendar, MapPin, Clock } from "react-feather";
import styles from "./EventCard.module.css";
import { usePopup } from "@/app/context/PopupContext";

const EventCard = ({ event, disableHover = false }) => {
    const {
    coverPhoto,
    eventTitle,
    eventOwner,
    date,
    Date: DateLegacy, // fallback for old DB records
    startTime,
    endTime,
    eventLocation,
    tags,
  } = event;
  const { openEventPopup } = usePopup();

  console.log("EventCard event:", event);

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
    const endDate = new Date(
      endTime.includes("T") ? endTime : `1970-01-01T${endTime}`
    );

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Time TBD";
    }

    const startStr = startDate.toLocaleTimeString([], options);
    const endStr = endDate.toLocaleTimeString([], options);

    const startAMPM = startStr.split(" ").pop();
    const endAMPM = endStr.split(" ").pop();

    if (startAMPM === endAMPM) {
      return `${startStr.replace(" " + startAMPM, "")} - ${endStr}`;
    } else {
      return `${startStr} - ${endStr}`;
    }
  }

  const displayDate = formatDisplayDate(date || DateLegacy);
  const displayTime = formatTimeRange(startTime, endTime);

  function handleClick() {
    console.log("EventCard clicked!", eventTitle);
    openEventPopup(event);
  }

  return (
    <article
        className={`${styles.eventCard} ${disableHover ? styles.noHover : ""}`}
        onClick={handleClick}
    >
      <div className={styles.eventCover}>
      <img
        className={styles.eventCoverImage}
        src={coverPhoto && coverPhoto.trim() !== "" ? coverPhoto : "/images/ucsd-logo.png"}
        alt={`${eventTitle} Cover Image`}
        onError={(e) => {
          e.currentTarget.src = "/images/image.png";
        }}
      />
      </div>
      <section className={styles.eventInfo}>
        <header className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{eventTitle}</h3>
          <p className={styles.eventOwner}>{eventOwner?.name}</p>
        </header>
        <div className={styles.eventDetails}>
          <span className={styles.eventDetail}>
            <MapPin className={styles.eventIcon} />
            <span className={styles.eventDetailsText}>{eventLocation}</span>
          </span>
          <time className={styles.eventDetail}>
            <Calendar className={styles.eventIcon} />
            <span className={styles.eventDetailsText}>{displayDate}</span>
          </time>
          <time className={styles.eventDetail}>
            <Clock className={styles.eventIcon} />
            <span className={styles.eventDetailsText}>{displayTime}</span>
          </time>
        </div>
      </section>
    </article>
  );
};

export default EventCard;
