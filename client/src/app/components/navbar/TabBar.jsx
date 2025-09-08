import styles from './TabBar.module.css';
import { LogOut, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';

export default function TabBar() {
    return (
    <nav className={styles.navBar}>
        <ul className={styles.navMiddleItems}>
            <li className={styles.navItem}><a className={styles.navLink} href="/home"><Home className={styles.navIcon} />Home</a></li>
            <li className={styles.navItem}><a className={styles.navLink} href="/create"><PlusSquare className={styles.navIcon} />Create</a></li>
            <li className={styles.navItem}><a className={styles.navLink} href="/saved"><Bookmark className={styles.navIcon} />Saved</a></li>
            <li className={styles.navItem}><a className={styles.navLink} href="profile"><User className={styles.navIcon} />Profile</a></li>
        </ul>
    </nav>
)};