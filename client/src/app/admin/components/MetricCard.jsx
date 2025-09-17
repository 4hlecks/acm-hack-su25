"use client";

import styles from "./MetricCard.module.css"

export default function MetricCard({ label, value, accent }) {
    return (
        <section className={styles.card} style={{ '--accent': accent }}>
            <h2 className={styles.data}>{value}</h2>
            <p className={styles.dataLabel}>{label}</p>
        </section>
    )
}