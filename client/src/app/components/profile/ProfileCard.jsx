import React from "react";
import "./ProfileCard.css";

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "";

  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // ensures AM/PM instead of 24h
  };

  const start = new Date(startTime).toLocaleTimeString([], options);
  const end = new Date(endTime).toLocaleTimeString([], options);

  // remove :00 if exact hour
  const cleanStart = start.replace(":00", "");
  const cleanEnd = end.replace(":00", "");

  return `${cleanStart} - ${cleanEnd}`;
}

function ProfileCard({ name, bio, profilePic, onEdit, isOwner, startTime, endTime }) {
  const timeRange = formatTimeRange(startTime, endTime);

  return (
    <section className="profile-section">
      <div className="profile-header">
        {/* Profile picture */}
        <img
          src={
            profilePic ||
            "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
          }
          alt={`${name || "Club"} Logo`}
          className="profile-logo"
        />

        {/* Info to the right */}
        <div className="profile-info">
          <div className="profile-title-row">
            <h1 className="profile-name">{name || "Club Name"}</h1>
            {isOwner ? (
              <button
                className="edit-btn"
                onClick={onEdit}
                aria-label="Edit profile"
              >
                Edit Profile / Events
              </button>
            ) : (
              <button className="follow-btn">Follow</button>
            )}
          </div>
          {timeRange && (
            <p className="profile-time">{timeRange}</p>
          )}

          <section className="profile-about">
            <h2>About</h2>
            <div className="about-description">
              {bio || "This club does not have a bio yet."}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
