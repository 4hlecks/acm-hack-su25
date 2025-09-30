'use client';

import styles from './SideBar.module.css';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, Flag, FileText, MoreVertical, Settings } from 'react-feather';
import SettingsDrawer from './SettingsDrawer';
import ProfileDrawer from './ProfileDrawer';
import NavItem from '@/app/(public)/components/navbar/NavItem';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001"; 

export default function SideBar() {
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <Home className={styles.navIcon}/> },
    { href: '/admin/events',    label: 'Events',    icon: <Calendar className={styles.navIcon}/> },
    { href: '/admin/users',     label: 'Users',     icon: <Users className={styles.navIcon}/> },
    { href: '/admin/reports',   label: 'Reports',   icon: <Flag className={styles.navIcon}/> },
    { href: '/admin/logs',      label: 'Logs',      icon: <FileText className={styles.navIcon}/> },
  ];

  const pathname = usePathname();

  const [profile, setProfile] = useState(null);

  // 1) Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setProfile({
          id: u.id,
          name: u.name,
          avatarUrl: u.profilePic || '',
        });
      }
    } catch (err) {
      console.error("Failed to read user from localStorage:", err);
    }
  }, []);

  // 2) Refresh when "authChanged" is dispatched
  useEffect(() => {
    function handleAuthChanged() {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          setProfile({
            id: u.id,
            name: u.name,
            avatarUrl: u.profilePic || '',
          });
        }
      } catch (err) {
        console.error("Failed to refresh profile from localStorage:", err);
      }
    }
    window.addEventListener("authChanged", handleAuthChanged);
    return () => window.removeEventListener("authChanged", handleAuthChanged);
  }, []);

  // 3) (Optional) Always check backend on mount for freshest profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/admin/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.admin) {
            setProfile({
              id: data.admin.id,
              name: data.admin.name,
              avatarUrl: data.admin.profilePic || '',
            });
            localStorage.setItem("user", JSON.stringify(data.admin));
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile from backend:", err);
      }
    }
    fetchProfile();
  }, []);

  const [openSettings, setOpenSettings] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  async function handleProfileSave({ name, avatarFile, avatarUrl }) {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (name) formData.append("name", name);
      if (avatarFile) {
        formData.append("profilePic", avatarFile);
      } else if (!avatarUrl) {
        formData.append("removePic", "true");
      }

      const res = await fetch(`${API_BASE}/api/admin/profile/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      const updatedAdmin = data.admin;
      setProfile({
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        avatarUrl: updatedAdmin.profilePic || "",
      });

      localStorage.setItem("user", JSON.stringify(updatedAdmin));
      window.dispatchEvent(new Event("authChanged"));

      setOpenProfile(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      alert(err.message);
    }
  }

  const logoItem = (<NavItem type="logo" />);

  return (
    <nav className={styles.sideBar}>
      {logoItem}

      <article className={styles.profileCard}>
        {profile?.avatarUrl ? (
          <img
            className={styles.profilePic}
            src={profile.avatarUrl}
            alt={`${profile.name} avatar`}
          />
        ) : (
          <canvas className={styles.profilePic} aria-label="No profile picture" />
        )}

        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{profile?.name || "Loading…"}</h2>
          <p className={styles.profileRole}>Administrator</p>
        </div>

        <button
          className={styles.editProfileButton}
          aria-label="Edit profile"
          onClick={() => setOpenProfile(true)}
        >
          <MoreVertical className={styles.navIcon} />
        </button>
      </article>

      <ul className={styles.navList}>
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={styles.navLink}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button className={styles.navLink} onClick={() => setOpenSettings(true)}>
        <Settings className={styles.navIcon}/> Settings
      </button>

      <SettingsDrawer open={openSettings} onOpenChange={setOpenSettings} />
      <ProfileDrawer
        open={openProfile}
        onOpenChange={setOpenProfile}
        initialProfile={{
          id: profile?.id,
          name: profile?.name,
          avatarUrl: profile?.avatarUrl,
        }}
        onSave={handleProfileSave}
      />
    </nav>
  );
}
