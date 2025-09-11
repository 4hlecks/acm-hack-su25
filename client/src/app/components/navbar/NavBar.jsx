'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './NavBar.module.css';
import { LogOut, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';
import SearchBar from '../SearchBar'
import Link from 'next/link';

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
            <button onClick={handleLogout} className={styles.navLogOut}><LogOut className={styles.navIcon} /> <span>Log Out</span></button>
        </div>
    </nav>
)};