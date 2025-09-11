'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './NavBar.module.css';
import { LogOut, LogIn, Bookmark, PlusSquare, User, Calendar} from 'react-feather';
import SearchBar from '../SearchBar'
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isClub, setIsClub] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsLoggedIn(true);

            try {
                const parsedUser = JSON.parse(userData);
                setIsClub(parsedUser.role === 'club'); 
              } catch {
                setIsClub(false);
              }
            } else {
              setIsLoggedIn(false);
              setIsClub(false);
            }
          }, []);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setIsClub(false);
            router.push('/login');
        } catch (err) {
        console.error('Logout failed:', err);
        }
    };

    return (
    <nav className={styles.navBar}>
        <div className={styles.leftSide}>
            <Link href="/" className={styles.siteLogo}>Current</Link>
            <SearchBar />
        </div>

        <div className={styles.rightSide}>
            {isLoggedIn ? (
                <>
            <ul className={styles.navMiddleItems}>
            {isClub ? (
              <>
                <li>
                  <Link
                    href="/add-event"
                    className={`${styles.navItem} ${
                      pathname === '/add-event' ? styles.activeLink : ''
                    }`}
                  >
                    <PlusSquare className={styles.navIcon} /> Create
                  </Link>
                </li>
                <li>
                <Link
                  href="/calendar"
                  className={`${styles.navItem} ${pathname === '/calendar' ? styles.activeLink : ''}`}
                >
                  <Calendar className={styles.navIcon} /> Calendar
                </Link>
                </li>
                <li>
                  <Link
                    href="/profile-page"
                    className={`${styles.navItem} ${
                      pathname === '/profile-page' ? styles.activeLink : ''
                    }`}
                  >
                    <User className={styles.navIcon} /> Profile
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/saved"
                    className={`${styles.navItem} ${
                      pathname === '/saved' ? styles.activeLink : ''
                    }`}
                  >
                    <Bookmark className={styles.navIcon} /> Saved
                  </Link>
                </li>
                <li>
                <Link
                  href="/calendar"
                  className={`${styles.navItem} ${pathname === '/calendar' ? styles.activeLink : ''}`}
                >
                  <Calendar className={styles.navIcon} /> Calendar
                </Link>
            </li>
                <li>
                  <Link
                    href="/following"
                    className={`${styles.navItem} ${
                      pathname === '/following' ? styles.activeLink : ''
                    }`}
                  >
                    <User className={styles.navIcon} /> Following
                  </Link>
                </li>
              </>
            )}
          </ul>

            <button onClick={handleLogout} className={styles.navAuth}> 
            <LogOut size={16} className={styles.navIcon} /> 
            <span>Logout</span>
          </button>
        </>
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