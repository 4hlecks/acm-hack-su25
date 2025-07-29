import styles from './NavBar.module.css';
import { LogOut, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';

export default function NavBar() {
    return (
    <nav className={styles.navBar}>
        <a href="/" className={styles.siteLogo}>Site Logo</a>
        <ul className={styles.navMiddleItems}>
            <li className={styles.navItem}><Home className={styles.navIcon} /> <a className={styles.navLink} href="/home">Home</a></li>
            <li className={styles.navItem}><Search className={styles.navIcon} /> <a className={styles.navLink} href="/search">Search</a></li>
            <li className={styles.navItem}><PlusSquare className={styles.navIcon} /> <a className={styles.navLink} href="/create">Create</a></li>
            <li className={styles.navItem}><Bookmark className={styles.navIcon} /> <a className={styles.navLink} href="/saved">Saved</a></li>
            <li className={styles.navItem}><User className={styles.navIcon} /> <a className={styles.navLink} href="profile">Profile</a></li>
        </ul>
        <button className={styles.navLogOut}><LogOut className={styles.navIcon} /> <span>Log Out</span></button>
    </nav>
)};