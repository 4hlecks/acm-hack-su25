"use client";   // 👈 must be the first line

import { useRouter, usePathname } from "next/navigation";
import styles from './NavBar.module.css';
import { LogOut, Search, Bookmark, PlusSquare, User } from 'react-feather';
import Link from "next/link";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();  

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className={styles.navBar}>
      {/* Logo that acts as Home */}
      <Link href="/" className={styles.siteLogo}>
        Current
      </Link>

      {/* Middle navigation items */}
      <ul className={styles.navMiddleItems}>
        <li className={styles.navItem}>
          <Search className={styles.navIcon} />
          <Link
            href="/search"
            className={`${styles.navLink} ${pathname === "/search" ? styles.activeLink : ""}`}
          >
            Search
          </Link>
        </li>

        <li className={styles.navItem}>
          <PlusSquare className={styles.navIcon} />
          <Link
            href="/add-event"
            className={`${styles.navLink} ${pathname === "/add-event" ? styles.activeLink : ""}`}
          >
            Create
          </Link>
        </li>

        <li className={styles.navItem}>
          <Bookmark className={styles.navIcon} />
          <Link
            href="/saved"
            className={`${styles.navLink} ${pathname === "/saved" ? styles.activeLink : ""}`}
          >
            Saved
          </Link>
        </li>

        <li className={styles.navItem}>
          <User className={styles.navIcon} />
          <Link
            href="/profile"
            className={`${styles.navLink} ${pathname === "/profile" ? styles.activeLink : ""}`}
          >
            Profile
          </Link>
        </li>
      </ul>

      {/* Logout button */}
      <button onClick={handleLogout} className={styles.navLogOut}>
        <LogOut className={styles.navIcon} />
        <span>Log Out</span>
      </button>
    </nav>
  );
}
