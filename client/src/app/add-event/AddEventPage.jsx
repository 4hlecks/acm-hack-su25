"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import styles from "./AddEventPage.module.css";

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

export default function AddEventPage() {
  const router = useRouter();

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);

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

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
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

    setCoverPhoto(file); // save for backend
    setPreviewUrl(URL.createObjectURL(file)); // preview
    setShowCropper(false);
  };

  // Category combobox UI state
  const [catInput, setCatInput] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [catActiveIndex, setCatActiveIndex] = useState(-1);
  const catBoxRef = useRef(null);

  // Tags
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const query = catInput.trim().toLowerCase();
  const filteredCategories = query
    ? CATEGORIES.filter((c) => c.toLowerCase().includes(query))
    : CATEGORIES;

  // Close the dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (catBoxRef.current && !catBoxRef.current.contains(e.target)) {
        setCatOpen(false);
        setCatActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelectCategory = (value) => {
    setEventCategory(value);
    setCatInput(value);
    setCatOpen(false);
    setCatActiveIndex(-1);
  };

  const handleCategoryKeyDown = (e) => {
    if (!catOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setCatOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(
        catActiveIndex === -1 ? 0 : catActiveIndex + 1,
        filteredCategories.length - 1
      );
      setCatActiveIndex(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(catActiveIndex - 1, 0);
      setCatActiveIndex(filteredCategories.length ? prev : -1);
    } else if (e.key === "Enter") {
      if (catOpen && catActiveIndex >= 0 && filteredCategories[catActiveIndex]) {
        e.preventDefault();
        handleSelectCategory(filteredCategories[catActiveIndex]);
      }
    } else if (e.key === "Escape") {
      setCatOpen(false);
      setCatActiveIndex(-1);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const t = newTag.trim();
    if (t && !tags.includes(t) && tags.length < 6) {
      setTags([...tags, t]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!CATEGORIES.includes(eventCategory)) {
      alert("Please select a category from the list.");
      return;
    }

    const formData = new FormData();
    formData.append("eventTitle", eventTitle);
    formData.append("eventDescription", eventDescription);
    formData.append("date", eventDate);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("eventLocation", eventLocation);
    formData.append("eventCategory", eventCategory);
    formData.append("tags", tags.join(","));
    if (coverPhoto) formData.append("coverPhoto", coverPhoto);

    try {
      const res = await fetch("http://localhost:5001/api/loadEvents/create", {
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
        <h2 className={styles.title}>
          <strong>Add New Event</strong>
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Upload */}
          <div className={styles.topRow}>
            <div
              className={styles.uploadBox}
              onClick={() => document.getElementById("fileInput").click()}
            >
              {previewUrl && previewUrl.trim() !== "" ? (
                <img
                  src={previewUrl}
                  alt="Cover"
                  className={styles.coverPreview}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
              <div className={styles.overlay}>Click to Change</div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </div>

            <div className={styles.inputs}>
              <label><b>Event Name</b></label>
              <input
                type="text"
                className={styles.inputBox}
                placeholder="The event name..."
                value={eventTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 80) setEventTitle(e.target.value);
                }}
                required
              />

              <label><b>Date</b></label>
              <input
                type="date"
                className={styles.inputBox}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />

              <div className={styles.timeRow}>
                <div>
                  <label><b>Start Time</b></label>
                  <input
                    type="time"
                    className={styles.inputBox}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label><b>End Time</b></label>
                  <input
                    type="time"
                    className={styles.inputBox}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
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
            onChange={(e) => {
              if (e.target.value.length <= 100) setEventLocation(e.target.value);
            }}
            required
          />

          {/* Description */}
          <label><b>Description</b></label>
          <textarea
            placeholder="A description of the event..."
            className={styles.textarea}
            value={eventDescription}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= 120) setEventDescription(e.target.value);
            }}          
            required
          ></textarea>

          {/* Category (searchable combobox) */}
          <label><b>Category</b></label>
          <div
            ref={catBoxRef}
            className={styles.comboWrapper}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
          >
            <input
              type="text"
              className={styles.inputBox}
              placeholder="Start typing to search categories..."
              value={catInput}
              onChange={(e) => {
                setCatInput(e.target.value);
                setEventCategory("");
                setCatOpen(true);
                setCatActiveIndex(-1);
              }}
              onFocus={() => setCatOpen(true)}
              onKeyDown={handleCategoryKeyDown}
              aria-autocomplete="list"
              aria-controls="category-listbox"
              aria-activedescendant={
                catActiveIndex >= 0 && filteredCategories[catActiveIndex]
                  ? `cat-opt-${catActiveIndex}`
                  : undefined
              }
              required
            />
            {catOpen && filteredCategories.length > 0 && (
              <ul
                id="category-listbox"
                role="listbox"
                className={styles.categoryList}
              >
                {filteredCategories.map((c, i) => (
                  <li
                    id={`cat-opt-${i}`}
                    key={c}
                    role="option"
                    aria-selected={eventCategory === c}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectCategory(c)}
                    className={[
                      styles.categoryItem,
                      i === catActiveIndex ? styles.activeItem : "",
                      eventCategory === c ? styles.selectedItem : "",
                    ].join(" ")}
                    onMouseEnter={() => setCatActiveIndex(i)}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}

            <div className={styles.addTagForm}>
              <input
                type="text"
                placeholder="Add tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={styles.addTagInput}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
                aria-label="Add tag"
              >
                +
              </button>
            </div>
          </div>

          {/* Crop popup */}
          {showCropper && (
            <div className={styles.popupOverlay}>
              <div className={styles.popup}>
                <div style={{ position: "relative", width: 300, height: 300 }}>
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
                  <button
                    type="button"
                    className={`${styles.cropBtn} ${styles.cancelBtn}`}
                    onClick={() => setShowCropper(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${styles.cropBtn} ${styles.saveBtn}`}
                    onClick={handleSaveCroppedImage}
                  >
                    Save Cover
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className={styles.postButton}>
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
