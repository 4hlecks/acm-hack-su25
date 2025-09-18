'use client';

import styles from './page.module.css';
import React, { useState, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
// Table + UI
import DataTable from '../../components/datatable/DataTable';
import { Button } from '../../components/buttons/Buttons';
import { Calendar, Tag, User, Mail, Command } from 'react-feather';

/**
 * Helper: "September 12, 2025"
 * Keep display formatting in the UI; store real dates server-side (ISO or epoch).
 */
function prettyDate(d) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    }).format(d);
}

export default function Dashboard() {
    // Replace this hardcoded array with data from your API.
    // Example API shape:
    //   GET /api/admin/metrics  -> { accountsInReview: 12, bugs: 36, reports: 7 }
    const overviewItems = [
        { label: 'accounts in review', value: '12', accent: '#E8D53D' },
        { label: 'bugs',               value: '36', accent: '#F76B6B' },
        { label: 'reports',            value: '7',  accent: '#61C861' },
    ];

    /**
     * Account Requests table state (moved from AccountRequestsTable into this page).
     * BACKEND:
     *   - On mount, fetch rows: GET /api/admin/account-requests?status=pending
     *   - Set rows with the response.
     */
    const [rows, setRows] = useState([
        {
            id: 'req_001',
            requestDate: new Date('2025-09-12'),
            type: 'Student',
            name: 'Alex Atienza',
            email: 'alatienza@ucsd.edu',
        },
        {
            id: 'req_002',
            requestDate: new Date('2025-09-10'),
            type: 'Org Officer',
            name: 'Jamie Lee',
            email: 'jlee@ucsd.edu',
        },
        {
            id: 'req_003',
            requestDate: new Date('2025-09-13'),
            type: 'Faculty',
            name: 'Prof. Dana Cruz',
            email: 'dcruz@ucsd.edu',
        },
        {
            id: 'req_004',
            requestDate: new Date('2025-08-30'),
            type: 'Student',
            name: 'Taylor Nguyen',
            email: 'tnguyen@ucsd.edu',
        },
    ]);

    /**
     * Approve/Deny handlers.
     * BACKEND:
     *   - Call your endpoints, then either refetch or optimistically update local state.
     *     POST /api/admin/account-requests/:id/approve
     *     POST /api/admin/account-requests/:id/deny
     */
    async function handleApprove(row) {
        // await fetch(`/api/admin/account-requests/${row.id}/approve`, { method: 'POST' });
        setRows(prev => prev.filter(r => r.id !== row.id));
    }

    async function handleDeny(row) {
        // await fetch(`/api/admin/account-requests/${row.id}/deny`, { method: 'POST' });
        setRows(prev => prev.filter(r => r.id !== row.id));
    }

    /**
     * Columns for Account Requests DataTable.
     * If you later move sorting/filtering to the server,
     * keep these purely presentational and feed already-sorted rows.
     */
    const columns = useMemo(() => ([
        {
            key: 'requestDate',
            header: 'Request Date',
            icon: <Calendar />,
            sortable: true,
            render: (row) => prettyDate(row.requestDate),
        },
        {
            key: 'type',
            header: 'Type',
            icon: <Tag />,
            sortable: true,
        },
        {
            key: 'name',
            header: 'Name',
            icon: <User />,
            sortable: true,
        },
        {
            key: 'email',
            header: 'Email Address',
            icon: <Mail />,
            sortable: true,
        },
        {
            key: 'action',
            header: 'Action',
            icon: <Command />,
            sortable: false,
            render: (row) => (
                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <Button
                        size="small"
                        width="auto"
                        variant="primary"
                        onClick={(e) => { e.stopPropagation?.(); handleApprove(row); }}
                    >
                        Approve
                    </Button>
                    <Button
                        size="small"
                        width="auto"
                        variant="danger"
                        onClick={(e) => { e.stopPropagation?.(); handleDeny(row); }}
                    >
                        Deny
                    </Button>
                </div>
            ),
        },
    ]), []);

    return (
        <>
            <h1>Dashboard</h1>

            {/* Overview metrics:
               Replace values with the result of GET /api/admin/metrics.
               For server fetching, make this a server component or use revalidate.
               For client fetching, use SWR/React Query and pass data here. */}
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

            {/* Send Announcement:
               Placeholder for a form. Later:
                 POST /api/admin/announcements { subject, message } */}
            <h2>Send Announcement</h2>

            {/* Account Requests:
               Now rendered inline using DataTable and the columns above.
               When hooked to backend:
                 - Fetch rows on mount.
                 - Approve/Deny call endpoints, then remove the row or refetch. */}
            <h2>Account Requests</h2>
            <div>
                <DataTable
                    columns={columns}
                    data={rows}
                    rowKey={(r) => r.id}
                    stickyHeader
                />
            </div>
        </>
    );
}
