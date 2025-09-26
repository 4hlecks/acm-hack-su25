"use client";
import styles from "./maintenance.module.css";

export default function MaintenancePage() {
  return (
    <div className={styles.container}>
      <div className={styles.popup}>
        <h1> Site Under Maintenance </h1>
        <p>We’ll be back soon. Thanks for your patience!</p>
      </div>
    </div>
  );
}
