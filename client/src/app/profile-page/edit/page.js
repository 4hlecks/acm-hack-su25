"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./edit.module.css";
import NavBar from "../../components/navbar/NavBar";
import EventCard from "../../components/events/EventCard";
import TabBar from "../../components/navbar/TabBar";
import Cropper from "react-easy-crop";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

async function getCroppedImg(imageSrc, cropPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg");
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

// ---------- helpers ----------
function parseDateOnly(raw) {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}
function parseTimeHM(raw) {
  if (!raw) return null;
  if (raw.includes("T")) {
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) return { h: dt.getHours(), m: dt.getMinutes() };
  }
  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const mer = ampm[3].toUpperCase();
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return { h, m };
  }
  const hhmm = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    const h = parseInt(hhmm[1], 10);
    const m = parseInt(hhmm[2], 10);
    if (!isNaN(h) && !isNaN(m)) return { h, m };
  }
  return null;
}
function eventStartTimestamp(e) {
  const rawDate = e.Date ?? e.date ?? null;
  const rawStart = e.startTime ?? null;
  const dateOnly = parseDateOnly(rawDate);
  if (!dateOnly) return Number.POSITIVE_INFINITY;
  const tm = parseTimeHM(rawStart) || { h: 0, m: 0 };
  return new Date(
    dateOnly.getFullYear(),
    dateOnly.getMonth(),
    dateOnly.getDate(),
    tm.h,
    tm.m,
    0,
    0
  ).getTime();
}

export default function EditProfile() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteEventId, setDeleteEventId] = useState(null);

  const [image, setImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
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
      setOrgEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error(err);
      setOrgEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  const sortedEvents = useMemo(
    () => [...orgEvents].sort((a, b) => eventStartTimestamp(a) - eventStartTimestamp(b)),
    [orgEvents]
  );

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", club.name);
    formData.append("bio", club.bio);
    const res = await fetch(`${API_BASE}/users/updateProfile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      await fetchData();
      router.push("/profile-page");
    } else {
      alert("Error updating profile info");
    }
  };

  const handleSaveProfilePic = async () => {
    if (!rawFile || !croppedPixels) {
      alert("Please choose and crop a file first.");
      return;
    }
    const croppedBlob = await getCroppedImg(image, croppedPixels);
    const file = new File([croppedBlob], rawFile.name, { type: "image/jpeg" });

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profilePic", file);

    const res = await fetch(`${API_BASE}/users/updateProfile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      await fetchData();
      setShowCropper(false);
      setImage(null);
      setPreviewUrl(URL.createObjectURL(file));
      router.push("/profile-page");
    } else {
      alert("Error updating profile picture");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/loadEvents/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setOrgEvents((prev) => prev.filter((e) => e._id !== eventId));
    } else {
      alert("Failed to delete event");
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <>
      <NavBar />
      <main className={styles.pageContent}>
        <div className={styles.profileHeader}>
          <div className={styles.profilePicWrapper}>
            <div
              className={styles.profilePicContainer}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <img
                src={
                  previewUrl
                    ? previewUrl
                    : club?.profilePic?.startsWith?.("/uploads")
                    ? `${API_BASE}${club.profilePic}`
                    : club?.profilePic ||
                      "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
                }
                alt="Profile"
                className={styles.profilePic}
              />
              <div className={styles.overlay}>Click to edit</div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setRawFile(file);
                  setImage(URL.createObjectURL(file));
                  setShowCropper(true);
                }}
              />
            </div>

            {showCropper && (
              <div className={styles.popupOverlay}>
                <div className={styles.popup}>
                  <div style={{ position: "relative", width: 300, height: 300 }}>
                    <Cropper
                      image={image}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className={styles.cropActions}>
                  <button
                    className={`${styles.cropBtn} ${styles.cancelBtn}`}
                    onClick={() => setShowCropper(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.cropBtn} ${styles.saveBtn}`}
                    onClick={handleSaveProfilePic}
                  >
                    Save Logo
                  </button>
                </div>

                </div>
              </div>
            )}
          </div>

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
            <button onClick={handleSaveProfile} className={`${styles.actionBtn} ${styles.saveBtn}`}>
              Save Info
            </button>
          </div>
        </div>

        <div className={styles.eventsHeader}>
          <h2><strong>Manage Events</strong></h2>
        </div>

        <section className={styles.eventGrid}>
          {sortedEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            sortedEvents.map((event) => (
              <div key={event._id} className={styles.eventWrapper}>
                <EventCard event={event} disableHover />
                <div className={styles.eventActions}>
                  <button onClick={() => router.push(`/events/${event._id}/edit`)} className={styles.actionBtn}>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteEventId(event._id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      {deleteEventId && (
  <div className={styles.popupOverlay}>
    <div className={styles.popup}>
      <h3>Are you sure you want to delete this event?</h3>
      <div className={styles.cropActions}>
        <button
          className={`${styles.cropBtn} ${styles.cancelBtn}`}
          onClick={() => setDeleteEventId(null)}
        >
          Cancel
        </button>
        <button
          className={`${styles.cropBtn} ${styles.deleteBtn}`}
          onClick={async () => {
            await handleDeleteEvent(deleteEventId);
            setDeleteEventId(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      <TabBar />
    </>
  );
}
