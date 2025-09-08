import styles from './NavBar.module.css';
import { LogOut, Home, Search, Bookmark, PlusSquare, User} from 'react-feather';
import SearchBar from '../SearchBar'

export default function NavBar() {
    return (
    <nav className={styles.navBar}>
        <div className={styles.leftSide}>
            <a href="/" className={styles.siteLogo}>current</a>
            <SearchBar />
        </div>
        <div className={styles.rightSide}>
            <ul className={styles.navMiddleItems}>
                <li className={styles.navItem}><a className={styles.navLink} href="/saved"><Bookmark className={styles.navIcon} /> Saved</a></li>
                <li className={styles.navItem}><a className={styles.navLink} href="/create"><PlusSquare className={styles.navIcon} /> Create</a></li>
                <li className={styles.navItem}><a className={styles.navLink} href="profile"><User className={styles.navIcon} /> Profile</a></li>
            </ul>
            <button className={styles.navLogOut}><LogOut className={styles.navIcon} /> <span>Log Out</span></button>
        </div>
    </nav>
)};