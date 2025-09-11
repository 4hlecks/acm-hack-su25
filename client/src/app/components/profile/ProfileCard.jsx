import React from 'react';
import './ProfileCard.css';

function ProfileCard({ name, handle, bio, profilePic, onEdit, isOwner}) {
  return (
    <section className="profile-section">
      <div className="profile-header">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
          alt={`${name || 'Club'} Logo`}
          className="profile-logo"
        />
        <div className="profile-info">
          <div className="profile-title-row">
            <h1 className="profile-name">{name || 'Club Name'}</h1>
            {handle && <span className="profile-handle">@{handle}</span>}
          </div>
          <div className="profile-actions">
            {isOwner ? (
                <button
                  className="edit-btn"
                  onClick={onEdit}
                  aria-label="Edit profile"
                >
                  Edit
                </button>
              ) : (
                <button className="follow-btn">Follow</button>
              )}
            </div>
        </div>
      </div>
      <div className="profile-about">
        <h2>About</h2>
        <div className="about-description">
          {bio || 'This club has not added a bio yet.'}
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
