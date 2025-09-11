'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './NavBar.module.css';
import { LogOut, LogIn, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';
import SearchBar from '../SearchBar'
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Checks if JWT exists in localStorage
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
      }, []);

    const handleLogout = async () => {
        try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/login');
        } catch (err) {
        console.error('Logout failed:', err);
        }
    };

    return (
    <nav className={styles.navBar}>
        <div className={styles.leftSide}>
            <Link href="/" className={styles.siteLogo}>current</Link>
            <SearchBar />
        </div>
        <div className={styles.rightSide}>
            <ul className={styles.navMiddleItems}>
                <li>
                <Link
                    href="/saved"
                    className={`${styles.navItem}
                                ${pathname === '/saved'
                                ? styles.activeLink : ''}`}
                >
                    <Bookmark className={styles.navIcon} /> Saved
                </Link>
                </li>
                <li>
                <Link
                    href="/add-event"
                    className={`${styles.navItem}
                                ${pathname === '/add-event'
                                ? styles.activeLink : ''}`}
                >
                    <PlusSquare className={styles.navIcon} /> Create
                </Link>
                </li>
                <li>
                <Link
                    href="/profile_page"
                    className={`${styles.navItem}
                                ${pathname === '/profile_page'
                                ? styles.activeLink : ''}`}
                >
                    <User className={styles.navIcon} /> Profile
                </Link>
                </li>
            </ul>
            {/* Conditionally show login/logout */}
            {isLoggedIn ? (
                <button onClick={handleLogout} className={styles.navAuth}> 
                <LogOut size={16} className={styles.navIcon} /> 
                <span>Logout</span>
          </button>
        ) : (
          <Link href="/login" className={styles.navAuth}>
            <LogIn size={16} className={styles.navIcon} /> 
            <span>Login</span> 
          </Link>
        )}
      </div>
    </nav>
  );
}