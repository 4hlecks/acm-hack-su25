"use client";

import { useState, useEffect } from "react";
import styles from "./maintenance.module.css";

export const dynamic = 'force-dynamic'

export default function AdminMaintenancePage() {
  const [maintenance, setMaintenance] = useState(false);

  // Load current state from API
  useEffect(() => {
    fetch("/api/maintenance")
      .then((res) => res.json())
      .then((data) => setMaintenance(data.enabled))
      .catch((err) => console.error("Failed to fetch maintenance mode", err));
  }, []);

  // Toggle maintenance mode
  const toggleMaintenance = async () => {
    const newState = !maintenance;
    setMaintenance(newState);

    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState }),
      });
    } catch (err) {
      console.error("Failed to update maintenance mode", err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin: Maintenance Mode</h1>
      <p className={styles.status}>
        Current status:{" "}
        <span className={maintenance ? styles.enabled : styles.disabled}>
          {maintenance ? "Enabled" : "Disabled"}
        </span>
      </p>
      <button onClick={toggleMaintenance} className={styles.toggleButton}>
        {maintenance ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
      </button>
    </div>
  );
}