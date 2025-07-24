import React from "react";
import styles from './events.css'

const EventTag = ({ label }) => {
    /* const tagColors = {
        fundraiser: "#80791cff",
        free: "#b2f2bb",
        gbm: "#d0ebff",
    }

    const color = tagColors[label.toLowerCase()] || "e9ecef"; */

    return (
        <span className="tag">
            {label}
        </span>
    );
};

export default EventTag;