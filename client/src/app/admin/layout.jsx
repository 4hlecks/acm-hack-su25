import SideBar from './components/SideBar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
    return (
        <div className={styles.adminShell}>
            <SideBar className={styles.adminNavigation} />
            <main className={styles.adminContent}>{children}</main>
        </div>
    )
}