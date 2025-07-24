import styles from './navbar.css'

export default function NavBar() {
    return <nav>
        <a href="/" className="site-logo">Site Logo</a>
        <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/saved">Saved</a></li>
            <li><a href="/create">Create</a></li>
            <li><a href="profile">Profile</a></li>
        </ul>
        <button>Log Out</button>
    </nav>
}