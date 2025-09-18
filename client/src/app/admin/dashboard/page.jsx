// This page currently renders static/demo content.
// To connect to your backend (Express/Next Route Handlers + MongoDB), see the comments below.

import styles from './page.module.css';
import MetricCard from '../components/MetricCard';
import AccountRequestsTable from '../components/AccountRequestsTable';

export default function Dashboard() {
    // Replace this hardcoded array with data from your API.
    // Example API shape:
    //   GET /api/admin/metrics  -> { accountsInReview: 12, bugs: 36, reports: 7 }
    const overviewItems = [
        { label: "accounts in review", value: "12", accent: "#E8D53D" },
        { label: "bugs", value: "36", accent: "#F76B6B" },
        { label: "reports", value: "7", accent: "#61C861" },
    ];
    
    return (
        <>
            <h1>Dashboard</h1>

            {/* "Overview" metrics:
                - Each MetricCard expects { label, value, accent }.
                - When wired to backend, pass real values (strings) returned by /api/admin/metrics.
                - If you want live updates, pair with SWR (client) or set revalidate in a server fetch. */}
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

            {/* "Send Announcement":
                - Placeholder section for an announcements form (e.g., subject + message). */}
            <h2>Send Announcement</h2>

            {/* "Account Requests":
                - <AccountRequestsTable /> currently uses mock data.
                - To hook it to backend, we could:
                    (A) Keep the table self-contained but replace its mock with a fetch:
                        - Inside AccountRequestsTable, fetch GET /api/admin/account-requests?status=pending
                        - Implement Approve/Deny with:
                            POST /api/admin/account-requests/:id/approve
                            POST /api/admin/account-requests/:id/deny
                          Then refetch or optimistically update local state.
                    (B) Lift data to this page and pass rows to the table:
                        - Fetch rows here (server or client), then:
                            <AccountRequestsTable rows={rows} onApprove={...} onDeny={...} />
                        - In onApprove/onDeny, call your API endpoints above, then update state.
                - Auth: protect endpoints to admins only.*/}
            <h2>Account Requests</h2>
            <AccountRequestsTable />
        </>
    );
}