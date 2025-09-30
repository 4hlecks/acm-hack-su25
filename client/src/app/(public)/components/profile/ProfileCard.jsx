import React, { useState, useEffect } from "react";
import styles from "./ProfileCard.module.css";
import { Button } from "@/components/buttons/Buttons";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "";

  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const start = new Date(startTime).toLocaleTimeString([], options);
  const end = new Date(endTime).toLocaleTimeString([], options);

  const cleanStart = start.replace(":00", "");
  const cleanEnd = end.replace(":00", "");

  return `${cleanStart} - ${cleanEnd}`;
}

function ProfileCard({
  name,
  bio,
  profilePic,
  onEdit,
  isOwner,
  startTime,
  endTime,
  clubId,
}) {
  const timeRange = formatTimeRange(startTime, endTime);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user info
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const User = JSON.parse(userData);
        setCurrentUser(User);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Check if current user is already following this club
  useEffect(() => {
    const checkFollow = async () => {
      if (!clubId || !currentUser || isOwner || currentUser.role !== "user")
        return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE}/users/${currentUser.id}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const isCurrentlyFollowing = data.some((club) => club._id === clubId);
          setIsFollowing(isCurrentlyFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    checkFollow();
  }, [clubId, currentUser, isOwner]);

  const handleFollow = async () => {
    if (loading || !currentUser) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(
        `${API_BASE}/users/${currentUser.id}/follow/${clubId}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show follow button if user is a normal user
  	const showFollowButton =
    	!isOwner && currentUser?.role === "user" && clubId;

	const displayBio =
	typeof bio === 'string' && bio.trim().length > 0
		? bio
		: "This club hasn't added a bio yet.";
  	const isEmptyBio = !(typeof bio === 'string' && bio.trim().length > 0);

  return (
    <article className={styles.profileCard}>
      <header className={styles.profileHeader}>
        <img
          src={
            profilePic ||
            "https://upload.wikimedia.org/wikipedia/commons/6/6a/ACM_logo.svg"
          }
          alt={`${name || "Club"} Logo`}
          className={styles.profilePicture}
        />
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{name || "Club Name"}</h2>

          {isOwner ? (
            <Button
              size="medium"
              width="auto"
              variant="secondary"
              onClick={onEdit}
              aria-label="Edit profile"
            >
              Edit Profile / Events
            </Button>
          ) : showFollowButton ? (
            isFollowing ? (
              <Button
                size="medium"
                width="auto"
                variant="primary" // unfollow = primary
                onClick={handleFollow}
                disabled={loading}
                aria-label="Unfollow user"
              >
                Following
              </Button>
            ) : (
              <Button
                size="medium"
                width="auto"
                variant="follow" // follow = follow variant
                onClick={handleFollow}
                disabled={loading}
                aria-label="Follow user"
              >
                Follow
              </Button>
            )
          ) : null}
        </div>
      </header>

       <section className={styles.profileContent}>
        <h3 className={styles.profileBioTitle}>About</h3>
        <p
          className={styles.profileBio}
          data-empty={isEmptyBio ? 'true' : 'false'}
        >
          {displayBio}
        </p>
      </section>
    </article>
  );
}

export default ProfileCard;
