'use client'

import { useEffect, useState } from 'react';
import {
    Bookmark, Calendar, PlusSquare, User, Users,
    Command, LogIn, LogOut
} from 'react-feather';
import { usePopup } from '@/app/(public)/context/PopupContext';
import styles from './NavBar.module.css';
import NavItem from './NavItem';
import SearchBar from '../searchbar/SearchBar';

export default function NavBar() {
    const [ready, setReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('student'); // 'student' | 'club' | 'admin'
    const { openEventPopup, handleClubSelect } = usePopup();

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                setIsLoggedIn(true);
                const r = (JSON.parse(userData)?.role || 'student').toLowerCase();
                setRole(r === 'admin' ? 'admin' : r === 'club' ? 'club' : 'student');
            } else {
                setIsLoggedIn(false);
                setRole('student');
            }
        } catch {
            setIsLoggedIn(false);
            setRole('student');
        } finally {
            setReady(true);
        }
    }, []);

    // Site Logo
    const logoItem = (<NavItem type="logo" />);

    // Student Navigation Items
    const studentItems = [
        { action: '/calendar',  label: 'Calendar', icon: <Calendar className={styles.navIcon}/> },
        { action: '/saved',     label: 'Saved',   icon: <Bookmark className={styles.navIcon}/> },
        { action: '/following', label: 'Following',    icon: <Users className={styles.navIcon}/> },
    ];

    // Club Navigation Items
    const clubItems = [
        { action: '/calendar',     label: 'Calendar', icon: <Calendar className={styles.navIcon}/> },
        { action: '/add-event',    label: 'Create',   icon: <PlusSquare className={styles.navIcon}/> },
        { action: '/profile-page', label: 'Profile',  icon: <User className={styles.navIcon}/> },
    ];

    // Admin Navigation Items
    const adminItems = [
        { action: '/admin', label: 'Admin Dashboard', icon: <Command className={styles.navIcon} />}
    ];

    // Navigation items depending on role
    const navItems = role === 'admin' ? adminItems : role === 'club' ? clubItems : studentItems;

    // Login/Logout
    const handleLogoutClick = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setRole('student');
        } catch {}
    };

    const authItem = isLoggedIn ? (
        <NavItem
            type="link"
            action="/login"
            icon={<LogOut className={styles.navIcon} />}
            label="Logout"
            onClick={handleLogoutClick}
        />
    ) : (
        <NavItem
            type="link"
            action="/login"
            icon={<LogIn className={styles.navIcon} />}
            label="Login"
        />
    );

    if (!ready) return null; // avoids flicker before reading localStorage

    return (
        <nav className={styles.navBar}>
            {logoItem}
            <SearchBar onEventClick={openEventPopup} onClubSelect={handleClubSelect} />
            <ul className={styles.navItemList}>
                {isLoggedIn &&
                    navItems.map(item => (
                        <li key={item.label}>
                            <NavItem
                                type="link"
                                action={item.action}
                                icon={item.icon}
                                label={item.label}
                            />
                        </li>
                    ))}
                <li>{authItem}</li>
            </ul>
        </nav>
    );
}