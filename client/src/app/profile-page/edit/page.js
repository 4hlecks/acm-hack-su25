"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./edit.module.css";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import TabBar from "../../components/navbar/TabBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function EditProfile() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null); // 🔑 for delete confirmation

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [profileRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/users/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/loadEvents/byOwner/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const { events } = await eventsRes.json();

        setClub(profileData.club);
        setOrgEvents(events || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", club.name);
    formData.append("bio", club.bio);
    if (club.profilePicFile) {
      formData.append("profilePic", club.profilePicFile);
    }

    const res = await fetch(`${API_BASE}/users/updateProfile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert("Profile updated!");
      router.push("/profile-page");
    } else {
      alert("Error updating profile");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/loadEvents/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setOrgEvents(orgEvents.filter((e) => e._id !== eventId));
    } else {
      alert("Failed to delete event");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        {/* Editable Profile Info */}
        <div className={styles.profileHeader}>
          {/* Profile Pic + Button */}
          <div className={styles.profilePicWrapper}>
            <img
              src={
                club?.profilePic ||
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
              }
              alt="Profile"
              className={styles.profilePic}
            />
            <label className={styles.actionBtn}>
              Edit Logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setClub({ ...club, profilePicFile: e.target.files[0] })
                }
                hidden
              />
            </label>
          </div>

          {/* Editable fields */}
          <div className={styles.profileForm}>
            <label className={styles.label}>Edit Name</label>
            <input
              className={styles.inputWide}
              value={club?.name || ""}
              onChange={(e) => setClub({ ...club, name: e.target.value })}
            />

            <label className={styles.label}>Edit About</label>
            <textarea
              className={styles.textareaWide}
              value={club?.bio || ""}
              onChange={(e) => setClub({ ...club, bio: e.target.value })}
            />

            <button
              onClick={handleSaveProfile}
              className={`${styles.actionBtn} ${styles.saveBtn}`}
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Events Management */}
        <div className={styles.eventsHeader}>
          <h2>
            <strong>Manage Events</strong>
          </h2>
        </div>

        <section className={styles.eventGrid}>
          {orgEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            orgEvents.map((event) => (
              <div key={event._id}>
                <EventCard event={event} />
                <div className={styles.eventActions}>
                  <button
                    onClick={() => setEditingEvent(event)}
                    className={styles.actionBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteEventId(event._id)} // 🔑 open confirm popup
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Popup for editing event */}
        {editingEvent && (
          <div className={styles.popup}>
            <h3>Edit Event</h3>
            <input
              value={editingEvent.eventTitle}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, eventTitle: e.target.value })
              }
            />
            <textarea
              value={editingEvent.eventDescription}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  eventDescription: e.target.value,
                })
              }
            />
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${API_BASE}/api/loadEvents/${editingEvent._id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editingEvent),
                  }
                );
                if (res.ok) {
                  setOrgEvents((prev) =>
                    prev.map((e) =>
                      e._id === editingEvent._id ? editingEvent : e
                    )
                  );
                  setEditingEvent(null);
                }
              }}
              className={styles.actionBtn}
            >
              Save Event
            </button>
            <button
              onClick={() => setEditingEvent(null)}
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
            >
              Cancel
            </button>
          </div>
        )}

        {/* 🔑 Popup for delete confirmation */}
        {deleteEventId && (
          <div className={styles.popup}>
            <h3>Are you sure you want to delete this event?</h3>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <button
                className={styles.actionBtn}
                onClick={() => setDeleteEventId(null)}
              >
                Cancel
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={async () => {
                  await handleDeleteEvent(deleteEventId);
                  setDeleteEventId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </main>
      <TabBar />
    </>
  );
}
