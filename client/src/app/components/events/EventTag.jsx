import React from "react";
import styles from './EventTag.module.css'

const EventTag = ({ label }) => {
    return (
        <span className={styles.tag}>
            <strong>{label}</strong>
        </span>
    );
};

export default EventTag;