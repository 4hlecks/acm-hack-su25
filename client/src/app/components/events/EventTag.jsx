import React from "react";
import styles from './events.css'

const EventTag = ({ label }) => {
    return (
        <span className="tag">
            {label}
        </span>
    );
};

export default EventTag;