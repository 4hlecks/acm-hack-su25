'use client';

import styles from './TabBar.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';
import Link from 'next/link';

export default function TabBar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
    <nav className={styles.navBar}>
        <ul className={styles.navMiddleItems}>
            <li>
            <Link
                href="/"
                className={`${styles.navItem}
                            ? styles.activeLink : ''}`}
            >
                <Home className={styles.navIcon} /> Home
            </Link>
            </li>
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
    </nav>
)};