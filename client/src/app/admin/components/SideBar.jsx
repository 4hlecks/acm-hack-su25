'use client';

import styles from './SideBar.module.css';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, Flag, FileText, MoreVertical, Settings } from 'react-feather';
import SettingsDrawer from './SettingsDrawer';

export default function SideBar() {
    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <Home className={styles.navIcon}/> },
        { href: '/admin/events', label: 'Events', icon: <Calendar className={styles.navIcon}/> },
        { href: '/admin/users', label: 'Users', icon: <Users className={styles.navIcon}/> },
        { href: '/admin/reports', label: 'Reports', icon: <Flag className={styles.navIcon}/> },
        { href: '/admin/logs', label: 'Logs', icon: <FileText className={styles.navIcon}/> },
    ];

    const profilePic = false;
    const pathname = usePathname();

    const [openSettings, setOpenSettings ] = useState(false);

    return (
        <nav className={styles.sideBar}>
            <Link href="/" className={styles.siteLogo}>current</Link>
            <article className={styles.profileCard}>
                {/* Placeholder Profile Picture */}
                {profilePic ? (
                    <img className={styles.profilePic} />
                ) : (
                    <canvas className={styles.profilePic}></canvas>
                )}
                <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>John Doe</h2>
                    <p className={styles.profileRole}>Administrator</p>
                </div>
                <button className={styles.editProfileButton}>
                    <MoreVertical className={styles.navIcon} />
                </button>
            </article>
            <ul className={styles.navList}>
                {navItems.map(item => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + '/');

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

            <button 
                className={styles.navLink}
                onClick={() => setOpenSettings(true)}
            >
                <Settings className={styles.navIcon}/> Settings
            </button>
            <SettingsDrawer open={openSettings} onOpenChange={setOpenSettings} />
        </nav>
    );
}