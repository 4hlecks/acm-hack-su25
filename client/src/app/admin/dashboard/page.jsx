'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import styles from './page.module.css';
import React from 'react';
import MetricCard from '../components/MetricCard';
// Table + UI
import DataTable from '../../../components/datatable/DataTable';
import { Button } from '../../../components/buttons/Buttons';
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function Dashboard() {
    const router = useRouter();
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "admin") {
        router.push("/login");
      }
    }, [router]);

    // Overview metrics state (replace later with API)
    const [overviewItems, setOverviewItems] = useState([
        { label: 'Accounts in Review', value: '0', accent: '#E8D53D' },
        { label: 'Bugs', value: '0', accent: '#F76B6B' },
        { label: 'Reports', value: '0', accent: '#61C861' },
    ]);

    // Account requests state (replace later with API)
    const [rows, setRows] = useState([]);

    // Fetch metrics + account requests
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // fetch metrics
        fetch(`${API_BASE}/api/admin/metrics`, {
            headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setOverviewItems([
              { label: 'Accounts in Review', value: String(data.accountsInReview || 0), accent: '#E8D53D' },
              { label: 'Bugs', value: String(data.bugs || 0), accent: '#F76B6B' },
              { label: 'Reports', value: String(data.reports || 0), accent: '#61C861' },
            ]);
          })
          .catch(err => console.error("Error fetching metrics:", err));

        // fetch account requests
        fetch(`${API_BASE}/api/admin/account-requests?status=pending`, {
            headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.items) {
              const mapped = data.items.map(u => ({
                id: u._id,
                requestDate: new Date(u.createdAt || Date.now()), // fallback if no createdAt
                type: u.role === "club"
                    ? "Club"
                    : u.role === "user"
                        ? "Student"
                        : u.role.charAt(0).toUpperCase() + u.role.slice(1),
                name: u.name,
                email: u.email,
              }));
              setRows(mapped);
            }
          })
          .catch(err => console.error("Error fetching requests:", err));
    }, []);

    /**
     * Approve/Deny handlers.
     * BACKEND:
     *   - Call your endpoints, then either refetch or optimistically update local state.
     *     POST /api/admin/account-requests/:id/approve
     *     POST /api/admin/account-requests/:id/deny
     */
    async function handleApprove(row) {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/api/admin/account-requests/${row.id}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        setRows(prev => prev.filter(r => r.id !== row.id));
    }

    async function handleDeny(row) {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/api/admin/account-requests/${row.id}/deny`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
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
