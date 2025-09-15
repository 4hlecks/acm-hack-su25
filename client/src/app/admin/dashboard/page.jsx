import styles from './page.module.css';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
    const overviewItems = [
        { label: "accounts in review", value: "12", accent: "#E8D53D" },
        { label: "bugs", value: "36", accent: "#F76B6B" },
        { label: "reports", value: "7", accent: "#61C861" },
    ];
    
    return (
        <>
            <h1>Dashboard</h1>
            <h2>Overview</h2>
            <div className={styles.overview}>
                {overviewItems.map(item => (
                    <MetricCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        accent={item.accent}
                    />
                ))}
            </div>
            <h2>Send Announcement</h2>
            <h2>Account Requests</h2>
        </>
    );
}