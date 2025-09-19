'use client';

import styles from './SideBar.module.css';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, Flag, FileText, MoreVertical, Settings } from 'react-feather';
import SettingsDrawer from './SettingsDrawer';
import ProfileDrawer from './ProfileDrawer'; // Drawer that edits profile picture + name

export default function SideBar() {
    // Central config for sidebar links (icon + label + route).
    // To add/remove a nav item, edit this array.
    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <Home className={styles.navIcon}/> },
        { href: '/admin/events',    label: 'Events',    icon: <Calendar className={styles.navIcon}/> },
        { href: '/admin/users',     label: 'Users',     icon: <Users className={styles.navIcon}/> },
        { href: '/admin/reports',   label: 'Reports',   icon: <Flag className={styles.navIcon}/> },
        { href: '/admin/logs',      label: 'Logs',      icon: <FileText className={styles.navIcon}/> },
    ];

    // Current route path (used to add aria-current to the active link for a11y & styling)
    const pathname = usePathname();

    // Local profile state so updates are reflected immediately in the sidebar UI.
    // Backend hookup:
    //   - On initial load: fetch current user `GET /api/me` and set name/avatarUrl here.
    //   - On save from ProfileDrawer: `PATCH /api/me` (or similar), then update this state.
    const [profile, setProfile] = useState({
        id: 'me',          // Replace with the real user id from your auth/user API
        name: 'John Doe',  // Seed value; overwritten after fetching /api/me
        avatarUrl: '',     // Seed value; set to the user’s avatar URL if you have one
    });

    // OPTIONAL: Load the real user from your backend on mount.
    // Keep it simple here; swap with your real fetcher (SWR/React Query/etc.) if you use one.
    useEffect(() => {
        // Example:
        // fetch('/api/me')
        //   .then(res => res.json())
        //   .then(user => setProfile({ id: user.id, name: user.name, avatarUrl: user.avatarUrl }))
        //   .catch(() => {});
    }, []);

    // Drawer open flags
    const [openSettings, setOpenSettings] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);

    return (
        <nav className={styles.sideBar}>
            {/* Site/brand link; adjust href to your actual landing page */}
            <Link href="/" className={styles.siteLogo}>current</Link>

            {/* Profile summary card (avatar + name + role + menu button) */}
            <article className={styles.profileCard}>
                {/* Profile Picture:
                   - If we have an avatar URL, show the image
                   - Otherwise show a placeholder <canvas> so the layout stays consistent */}
                {profile.avatarUrl ? (
                    <img
                        className={styles.profilePic}
                        src={profile.avatarUrl}
                        alt={`${profile.name} avatar`}
                    />
                ) : (
                    <canvas
                        className={styles.profilePic}
                        aria-label="No profile picture"
                    />
                )}

                {/* Text info for the current user.
                   - "Administrator" is hard-coded here; replace with the real role if you track it. */}
                <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>{profile.name}</h2>
                    <p className={styles.profileRole}>Administrator</p>
                </div>

                {/* Three-dots button to open the ProfileDrawer.
                   - a11y: aria-label so screen readers know what it does */}
                <button
                    className={styles.editProfileButton}
                    aria-label="Edit profile"
                    onClick={() => setOpenProfile(true)}
                >
                    <MoreVertical className={styles.navIcon} />
                </button>
            </article>

            {/* Main navigation */}
            <ul className={styles.navList}>
                {navItems.map(item => {
                    // Mark link active for exact path or nested routes (e.g., /admin/users/123)
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <li key={item.href} className={styles.navItem}>
                            <Link
                                href={item.href}
                                className={styles.navLink}
                                // a11y: tell assistive tech which link represents the current page
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* Settings shortcut at the bottom (optional) */}
            <button
                className={styles.navLink}
                onClick={() => setOpenSettings(true)}
                // You can switch to <Link> if Settings is a full page instead of a drawer.
            >
                <Settings className={styles.navIcon}/> Settings
            </button>

            {/* ==== Drawers ==== */}

            {/* Settings drawer toggled by the button above.
               - Pass any settings data + onSave here to integrate with your backend. */}
            <SettingsDrawer
                open={openSettings}
                onOpenChange={setOpenSettings}
            />

            {/* Profile drawer toggled by the three-dots button.
               - initialProfile: seeds the drawer form with current values
               - onSave: receives { id, name, avatarFile?, avatarUrl? }
                   Backend hookup example:
                     1) If avatarFile exists, upload it (POST /api/uploads or S3 direct upload)
                     2) Then PATCH /api/me with { name, avatarUrl }
                     3) On success, update local sidebar state so UI reflects changes */}
            <ProfileDrawer
                open={openProfile}
                onOpenChange={setOpenProfile}
                initialProfile={profile}
                onSave={async (data) => {
                    // --- Example backend flow (pseudo):
                    // let newAvatarUrl = data.avatarUrl;
                    // if (data.avatarFile) {
                    //     const form = new FormData();
                    //     form.append('file', data.avatarFile);
                    //     const uploadRes = await fetch('/api/uploads/avatar', { method: 'POST', body: form });
                    //     const { url } = await uploadRes.json();
                    //     newAvatarUrl = url;
                    // }
                    // await fetch('/api/me', {
                    //     method: 'PATCH',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({ name: data.name, avatarUrl: newAvatarUrl }),
                    // });

                    // Update local sidebar view immediately.
                    setProfile(prev => ({
                        ...prev,
                        name: data.name ?? prev.name,
                        // If your upload endpoint returns a new URL, set it here.
                        // If the user cleared the image in the drawer, you could set this to ''.
                        avatarUrl: data.avatarUrl ?? prev.avatarUrl,
                    }));

                    // Close the drawer after saving.
                    setOpenProfile(false);
                }}
            />
        </nav>
    );
}
