"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./edit.module.css";
import EventCard from "../../components/events/EventCard";
import Cropper from "react-easy-crop";
import { TextField, TextAreaField } from "@/components/form/Form";
import { Button } from "@/components/buttons/Buttons";
import NavItem from "../../components/navbar/NavItem";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

/* ---------- image cropping helpers ---------- */
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

/* ---------- event helpers ---------- */
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

/* ---------- page ---------- */
export default function EditProfile() {
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [orgEvents, setOrgEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [deleteEventId, setDeleteEventId] = useState(null);

  // cropping
  const [image, setImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // tabs
  const [tab, setTab] = useState("upcoming");

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

      if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
      if (!eventsRes.ok) throw new Error(`Events fetch failed: ${eventsRes.status}`);

      const profileData = await profileRes.json();
      const data = await eventsRes.json();

      setClub(profileData.club);
      setOrgEvents({
        upcoming: Array.isArray(data.upcomingEvents)
          ? data.upcomingEvents
          : Array.isArray(data.events)
          ? data.events
          : [],
        past: Array.isArray(data.pastEvents) ? data.pastEvents : [],
      });
    } catch (err) {
      console.error(err);
      setOrgEvents({ upcoming: [], past: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  const sortedUpcoming = useMemo(
    () => [...orgEvents.upcoming].sort((a, b) => eventStartTimestamp(a) - eventStartTimestamp(b)),
    [orgEvents.upcoming]
  );
  const sortedPast = useMemo(
    () => [...orgEvents.past].sort((a, b) => eventStartTimestamp(b) - eventStartTimestamp(a)),
    [orgEvents.past]
  );

  const list = tab === "upcoming" ? sortedUpcoming : sortedPast;

  async function handleSaveProfile() {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", club?.name || "");
    formData.append("bio", club?.bio || "");
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
  }

  async function handleSaveProfilePic() {
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
  }

  async function handleDeleteEvent(eventId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/loadEvents/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setOrgEvents((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((e) => e._id !== eventId),
      }));
    } else {
      alert("Failed to delete event");
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>;

  // safe img src (avoid empty string warning)
  const profileSrc =
    previewUrl ||
    (club?.profilePic?.startsWith?.("/uploads")
      ? `${API_BASE}${club.profilePic}`
      : club?.profilePic) ||
    "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header: image + Edit Name in a row; then Edit Bio + Save */}
        <section className={styles.profileHeader} aria-labelledby="edit-header">
          <div className={styles.editorGroup}>
            {/* Row: Picture + Edit Name */}
            <div className={styles.topRow}>
              {/* Picture */}
              <div className={styles.profilePicWrapper}>
                <div
                  className={styles.profilePicContainer}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <img
                    src={profileSrc || undefined}
                    alt="Profile"
                    className={styles.profilePic}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg";
                    }}
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
                        <Button
                          size="medium"
                          width="auto"
                          variant="secondary"
                          onClick={() => setShowCropper(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="medium"
                          width="auto"
                          variant="primary"
                          onClick={handleSaveProfilePic}
                        >
                          Save Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Name */}
              <div className={styles.editNameArea}>
                <TextField
                  id="club-name"
                  label="Edit Name"
                  layout="column"
                  fieldWidth="100%"
                  required
                  value={club?.name || ""}
                  onChange={(e) => setClub({ ...club, name: e.target.value })}
                  placeholder="Club name"
                />
              </div>
            </div>

            {/* Column: Bio + Save */}
            <div className={styles.bottomCol}>
              <TextAreaField
                id="club-bio"
                label="Edit Bio"
                layout="column"
                fieldWidth="100%"
                rows={6}
                value={club?.bio ?? ""}
                onChange={(e) => setClub({ ...club, bio: e.target.value })}
                placeholder="Tell students what your club is about…"
              />

              <div className={styles.saveRow}>
                <Button
                  size="medium"
                  width="fill"
                  variant="secondary"
                  onClick={handleSaveProfile}
                >
                  Save Info
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content (Tabs + Grid) */}
        <section
          aria-labelledby={tab === "upcoming" ? "upcoming-title" : "past-title"}
          className={styles.profileContent}
        >
          {/* Tabs */}
          <nav role="tablist" className={styles.tabs}>
            <NavItem
              type="button"
              label="Upcoming Events"
              action={() => setTab("upcoming")}
              role="tab"
              aria-selected={tab === "upcoming"}
              data-variant="pageTab"
              active={tab === "upcoming"}
            />
            <NavItem
              type="button"
              label="Past Events"
              action={() => setTab("past")}
              role="tab"
              aria-selected={tab === "past"}
              data-variant="pageTab"
              active={tab === "past"}
            />
          </nav>

          {/* Event Grid */}
          <div className={styles.eventGrid}>
            {list.length === 0 ? (
              <p className={styles.empty}>
                {tab === "upcoming" ? "No upcoming events." : "No events from the last 30 days."}
              </p>
            ) : (
              list.map((event) => (
                <article key={event._id} className={styles.eventCell}>
                  <EventCard event={event} disableHover />
                  {/* Action strip directly under the card */}
                  <div className={styles.cardActions}>
                    <Button
                      size="small"
                      width="fill"
                      variant="primary"
                      onClick={() => router.push(`/events/${event._id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      width="fill"
                      variant="danger"
                      onClick={() => setDeleteEventId(event._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Delete confirmation */}
      {deleteEventId && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3 className={styles.popupTitle}>Are you sure you want to delete this event?</h3>
            <div className={styles.cropActions}>
              <Button
                size="medium"
                width="auto"
                variant="secondary"
                onClick={() => setDeleteEventId(null)}
              >
                Cancel
              </Button>
              <Button
                size="medium"
                width="auto"
                variant="danger"
                onClick={async () => {
                  await handleDeleteEvent(deleteEventId);
                  setDeleteEventId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
