import React , {useState, useEffect} from "react";
import "./ProfileCard.css";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

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

function ProfileCard({ name, bio, profilePic, onEdit, isOwner, startTime, endTime, clubId }) {
  const timeRange = formatTimeRange(startTime, endTime);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  //Get current user info
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData){
      try {
        const User = JSON.parse(userData);
        setCurrentUser(User);
      } catch (error){
        console.error('Error parsing user data:', error)
      }
    }
  }, []);

  //Check if current user is already following this club
  useEffect(() => {
    const checkFollow = async () => {
      if (!clubId || !currentUser || isOwner || currentUser.role !== 'user') return;

      try{
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/users/${currentUser.id}/following`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok){
          const data = await response.json();
          console.log('API response:', data);

          const isCurrentlyFollowing = data.some(club => club._id === clubId);
          setIsFollowing(isCurrentlyFollowing)
        }
      } catch (error){
        console.error('Error checking follow status:', error)
      }
    };
    checkFollow();
  }, [clubId, currentUser, isOwner])

  const handleFollow = async () => {
    if (loading || !currentUser) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token){
        setLoading(false);
        return;
      }

      const method = isFollowing ? 'DELETE': 'POST';
      const response = await fetch(`${API_BASE}/users/${currentUser.id}/follow/${clubId}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok){
        setIsFollowing(!isFollowing);
      } else{
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update follow status');
      }
    } catch (error){
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  //Show follow button if user is a normal user
  const showFollowButton = !isOwner && currentUser?.role === 'user' && clubId;

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
            ) : showFollowButton ? (
              <button className={`follow-btn ${isFollowing ? 'following': ''}`}
              onClick={handleFollow}
              disabled={loading}
              aria-label={isFollowing ? 'Unfollow user': 'Follow user'}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : null}
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
