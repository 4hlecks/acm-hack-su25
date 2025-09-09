"use client";
import { useState } from "react";
import styles from './AddEventPage.module.css';

export default function AddEventPage() {
  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);

  // Tags
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("✅ handleSubmit fired!");

    const formData = new FormData();
    formData.append("eventTitle", eventTitle);
    formData.append("eventDescription", eventDescription);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("eventLocation", eventLocation);
    formData.append("eventCategory", eventCategory);
    formData.append("tags", tags.join(","));
    if (coverPhoto) {
      formData.append("coverPhoto", coverPhoto);
    }

    try {
      const res = await fetch("http://localhost:5002/api/loadEvents/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event");

      alert("✅ Event created successfully!");
      console.log("Backend response:", data);
    } catch (err) {
      console.error("❌ Error creating event:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2>Add New Event</h2>

        <form onSubmit={handleSubmit}>
          {/* Upload */}
          <div className={styles.topRow}>
            <div className={styles.uploadBox}>
              <input
                type="file"
                onChange={(e) => setCoverPhoto(e.target.files[0])}
              />
              <p><strong>Upload a Cover Photo</strong></p>
            </div>

            <div className={styles.inputs}>
              <label><b>Event Name</b></label>
              <input
                type="text"
                className={styles.inputBox}
                placeholder="The event name..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />

              <label><b>Date</b></label>
              <input
                type="date"
                className={styles.inputBox}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <div className={styles.timeRow}>
                <div>
                  <label><b>Start Time</b></label>
                  <input
                    type="time"
                    className={styles.inputBox}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label><b>End Time</b></label>
                  <input
                    type="time"
                    className={styles.inputBox}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <label><b>Location</b></label>
          <input
            type="text"
            placeholder="The location of the event..."
            className={styles.inputBox}
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
          />

          {/* Description */}
          <label><b>Description</b></label>
          <textarea
            placeholder="A description of the event..."
            className={styles.textarea}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          ></textarea>

          {/* Category */}
          <label><b>Category</b></label>
          <input
            type="text"
            placeholder="e.g. GBM, Social, Workshop"
            className={styles.inputBox}
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
          />

          {/* Tags */}
          <label><b>Tags</b></label>
          <div className={styles.tagContainer}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}

            <div className={styles.addTagForm}>
              <input
                type="text"
                placeholder="Add Tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={styles.addTagInput}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" className={styles.postButton}>Post</button>
        </form>
      </div>
    </div>
  );
}
