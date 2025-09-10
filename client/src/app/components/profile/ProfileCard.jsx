import React from 'react';
import './ProfileCard.css';

function ProfileCard() {
  return (
    <section className="profile-section">
      <div className="profile-header">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
          alt="ACM Logo"
          className="profile-logo"
        />
        <div className="profile-info">
          <div className="profile-title-row">
            <h1 className="profile-name">ACM</h1>
            <span className="profile-handle">@acm.ucsd</span>
          </div>
          <div className="profile-actions">
            <button className="follow-btn">Follow</button>
            <span className="settings-icon" title="Settings">⚙️</span>
          </div>
        </div>
      </div>
      <div className="profile-about">
        <h2>About</h2>
        <div className="about-description">
          Association for Computing Machinery<br />
          Code, Design, Innovate<br />
          Welcome to UCSD’s largest members-first computing org!
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
