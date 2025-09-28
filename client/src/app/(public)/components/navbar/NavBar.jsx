'use client'

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark, Calendar, PlusSquare, User, Users,
  Command, LogIn, LogOut
} from 'react-feather';
import { usePopup } from '@/app/(public)/context/PopupContext';
import styles from './NavBar.module.css';
import NavItem from './NavItem';
import SearchBar from '../searchbar/SearchBar';

export default function NavBar(props) {
  const variant = props['data-variant'] || 'default';
  const isTabbar = variant === 'tabbar';

  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('student'); // 'student' | 'club' | 'admin'
  const { openEventPopup, handleClubSelect } = usePopup();

  const pathname = usePathname();
  const router = useRouter();

  const readAuthFromStorage = useCallback(() => {
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

  // Initial read
  useEffect(() => {
    readAuthFromStorage();
  }, [readAuthFromStorage]);

  // Re-read on route changes (after login redirect, etc.)
  useEffect(() => {
    if (!ready) return;
    readAuthFromStorage();
  }, [pathname, ready, readAuthFromStorage]);

  // Re-read on window focus (user might log in from a popup or another tab)
  useEffect(() => {
    const onFocus = () => readAuthFromStorage();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [readAuthFromStorage]);

  // Cross-tab updates + custom same-tab event
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') readAuthFromStorage();
    };
    const onAuthChanged = () => readAuthFromStorage();

    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onAuthChanged);
    };
  }, [readAuthFromStorage]);

  // Call this after your login succeeds (in your login page/code):
  // window.dispatchEvent(new Event('auth:changed'));

  const dispatchAuthChanged = () => {
    try { window.dispatchEvent(new Event('auth:changed')); } catch {}
  };

  const handleLogoutClick = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setRole('student');
      dispatchAuthChanged();
      router.replace('/'); // optional: send to home after logout
      // router.refresh(); // optional if you have server components that depend on cookies
    } catch {}
  };

  const logoItem = (<NavItem type="logo" />);

  const studentItems = [
    { action: '/calendar',  label: 'Calendar', icon: <Calendar className={styles.navIcon}/> },
    { action: '/saved',     label: 'Saved',    icon: <Bookmark className={styles.navIcon}/> },
    { action: '/following', label: 'Following',icon: <Users className={styles.navIcon}/> },
  ];

  const clubItems = [
    { action: '/calendar',     label: 'Calendar', icon: <Calendar className={styles.navIcon}/> },
    { action: '/add-event',    label: 'Create',   icon: <PlusSquare className={styles.navIcon}/> },
    { action: '/profile-page', label: 'Profile',  icon: <User className={styles.navIcon}/> },
  ];

  const adminItems = [
    { action: '/admin', label: 'Admin Dashboard', icon: <Command className={styles.navIcon} /> }
  ];

  const navItems = role === 'admin' ? adminItems : role === 'club' ? clubItems : studentItems;

  const authItem = isLoggedIn ? (
    // Make logout a button so it doesn't navigate to /login
    <NavItem
      type="button"
      action={handleLogoutClick}     // your NavItem should call this when type="button"
      icon={<LogOut className={styles.navIcon} />}
      label="Logout"
    />
  ) : (
    <NavItem
      type="link"
      action="/login"
      icon={<LogIn className={styles.navIcon} />}
      label="Login"
      // When your login flow completes, call window.dispatchEvent(new Event('auth:changed'))
    />
  );

  if (!ready) return null;

  return (
    <nav
      data-variant={variant}
      className={`${styles.navBar} ${isTabbar ? styles.isTabbar : ''}`}
      aria-label={isTabbar ? 'Tab bar' : 'Primary'}
    >
      {!isTabbar && logoItem}
      {!isTabbar && (
        <SearchBar onEventClick={openEventPopup} onClubSelect={handleClubSelect} />
      )}

      <ul className={styles.navItemList}>
        {isLoggedIn &&
          navItems.map((item) => (
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
