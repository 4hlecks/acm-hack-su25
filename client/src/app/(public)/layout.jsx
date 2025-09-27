import NavBar from './components/navbar/NavBar';
import styles from './layout.module.css';

export default function PublicLayout({ children }) {
    return (
        <div className={styles.siteShell}>
            <header className={styles.siteHeader}>
                <NavBar />
            </header>
            <main className={styles.siteContent}>{children}</main>
            <footer className={styles.siteFooter}>
                <NavBar data-variant="tabbar" aria-label="Tab bar"/>
            </footer>
        </div>
    )
}