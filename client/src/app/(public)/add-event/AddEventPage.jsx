"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import styles from "./AddEventPage.module.css";

import { Calendar, Clock, MapPin, Image as ImageIcon, X } from "react-feather";
import {
  TextField,
  DateField,
  TimeField,
  TextAreaField,
  SelectField,
} from "@/components/form/Form";
import { Button } from "@/components/buttons/Buttons";
import AddTags from "../components/events/AddTags";

const CATEGORIES = [
  "Free Food",
  "Fundraiser",
  "Game Night",
  "GBM",
  "Networking",
  "Panel",
  "Social",
  "Study Jam",
  "Workshop",
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function AddEventPage() {
  const router = useRouter();

  // form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [tags, setTags] = useState([]);

  // image cropping state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
  }, []);

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });
  }

  async function getCroppedImg(imageSrc, cropPixels) {
    const img = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      img,
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setImage(URL.createObjectURL(file));
    setShowCropper(true);
  };

  const handleSaveCroppedImage = async () => {
    if (!rawFile || !croppedPixels) {
      alert("Please crop the image first.");
      return;
    }
    const croppedBlob = await getCroppedImg(image, croppedPixels);
    const file = new File([croppedBlob], rawFile.name, { type: "image/jpeg" });

    // save for backend + preview
    setRawFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCropper(false);
  };

  function addTag(t) {
    const v = t.trim();
    if (!v) return;
    // case-insensitive de-dupe
    const lower = v.toLowerCase();
    if (tags.some(tag => tag.toLowerCase() === lower)) return;
    if (tags.length >= 6) return;
    setTags(prev => [...prev, v]);
 }

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("eventTitle", eventTitle);
    formData.append("eventDescription", eventDescription);
    formData.append("date", eventDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("eventLocation", eventLocation);
    formData.append("eventCategory", eventCategory);
    formData.append("tags", tags.join(","));
    if (rawFile) formData.append("coverPhoto", rawFile);

    try {
      const res = await fetch(`${API_BASE}/api/loadEvents/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Your session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event");

      alert("Event created successfully!");
      router.push("/profile-page");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}><strong>Create New Event</strong></h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* top row: upload on left, fields on right */}
          <div className={styles.topRow}>
            {/* Upload box */}
            <div
              className={styles.uploadBox}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Cover" className={styles.coverPreview} />
              ) : (
                <div className={styles.uploadEmpty}>
                  <ImageIcon aria-hidden />
                  <p>No File Chosen</p>
                  <p className={styles.subtle}>Upload a Cover Photo</p>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </div>

            {/* Right column fields */}
            <div className={styles.rightCol}>
              <TextField
                id="event-name"
                label="Event Name"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value.slice(0, 80))}
                placeholder="The event name..."
                required
              />

              <DateField
                id="event-date"
                label="Date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                icon={<Calendar size={16} />}
                required
              />

              {/* Date & time in one row */}
              <div className={styles.dateRow}>
                <TimeField
                  id="event-start"
                  label="Start Time"
                  value={startTime}
				  fieldWidth="100%"
                  onChange={(e) => setStartTime(e.target.value)}
                  icon={<Clock size={16} />}
                  required
                />
                <TimeField
                  id="event-end"
                  label="End Time"
                  value={endTime}
				  fieldWidth="100%"
                  onChange={(e) => setEndTime(e.target.value)}
                  icon={<Clock size={16} />}
                  required
                />
              </div>
			  <TextField
                  id="event-location"
                  label="Location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value.slice(0, 100))}
                  placeholder="The location of the event..."
                  icon={<MapPin size={16} />}
                  required
                />
            </div>
          </div>

          <TextAreaField
            id="event-description"
            label="Description"
            value={eventDescription}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (e.target.value.trim() === "" || words.length <= 120) {
                setEventDescription(e.target.value);
              }
            }}
            rows={4}
            placeholder="A description of the event..."
            required
          />

          <SelectField
            id="event-category"
            label="Category"
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
            placeholder="e.g., GBM, Social, Workshop"
            required
          >
            <option value="" disabled>
              e.g., GBM, Social, Workshop
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          {/* Tags */}
          <div className={styles.tagsBlock}>
            <label className={styles.tagsLabel}>Tags</label>

            <div className={styles.tagsList}>
				{tags.map((t, i) => (
					<Button
					key={`${t}-${i}`}
					size="small"
					width="auto"
					variant="primary"
					iconRight={<X size={14} aria-hidden />}
					onClick={(e) => {
						e.preventDefault(); // avoid submitting the main form
						setTags(prev => prev.filter(x => x !== t));
					}}
					aria-label={`Remove tag ${t}`}
					title={`Remove ${t}`}
					type="button"
					>
					{t}
					</Button>
				))}
			</div>

            <AddTags
              placeholder="Add tags..."
              onAdd={addTag}
              className={styles.addTags}
            />
          </div>

          {/* Cropper modal */}
          {showCropper && (
            <div className={styles.cropOverlay}>
              <div className={styles.cropModal}>
                <div style={{ position: "relative", width: 320, height: 320 }}>
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="rect"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className={styles.cropActions}>
                  <Button variant="secondary" onClick={() => setShowCropper(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCroppedImage}>Save Cover</Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.submitRow}>
            <Button size="medium" variant="secondary" width="fill" type="submit">
              Post Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
