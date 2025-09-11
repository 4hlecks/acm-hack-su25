"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import TabBar from "../../components/navbar/TabBar";
import styles from "../page.module.css"; // reuse styles

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function EditProfilePage() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        setClub(data.club);
        setNewName(data.club?.name || "");
        setNewBio(data.club?.bio || "");

        if (data.club?._id) {
          const evRes = await fetch(`${API_BASE}/api/events/byClub/${data.club._id}`);
          if (evRes.ok) {
            const events = await evRes.json();
            setOrgEvents(Array.isArray(events) ? events : events.events || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("bio", newBio);
    if (profilePic) formData.append("profilePic", profilePic);

    try {
      const res = await fetch(`${API_BASE}/users/updateProfile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Profile updated!");
        router.push("/profile_page");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrgEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        {/* Editable profile section */}
        <section className="profile-section">
          <div className="profile-header">
            <img
              src={
                club?.profilePic ||
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
              }
              alt="Profile Logo"
              className="profile-logo"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </div>

          <div className="profile-info" style={{ marginTop: "12px", width: "100%" }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="Club Name"
            />
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="border rounded p-2 w-full mt-2"
              rows={4}
              placeholder="Bio"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-700 text-white px-4 py-2 rounded mt-4 self-start"
          >
            Save Changes
          </button>
        </section>

        {/* Editable events section */}
        <div className={styles.eventsHeader}>
          <h2>Manage Events</h2>
        </div>

        <section className={styles.eventGrid}>
          {orgEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            orgEvents.map((event) => (
              <div key={event._id} className="border p-4 rounded relative">
                <EventCard event={event} />
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() => router.push(`/events/edit/${event._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <TabBar />
    </>
  );
}
