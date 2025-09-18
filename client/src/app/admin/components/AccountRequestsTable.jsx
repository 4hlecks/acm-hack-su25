'use client';
import React, { useState } from 'react';
import DataTable from '../../components/datatable/DataTable';
import { Button } from '../../components/buttons/Buttons';
import { Calendar, Tag, User, Mail, Command } from 'react-feather';

// helper: "September 12, 2025"
function prettyDate(d) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    }).format(d);
}

export default function AccountRequestsTable() {
    // Local mock data + state (swap with fetch later)
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

    function handleApprove(row) {
        // TODO: call your API here
        // await fetch(`/api/admin/account-requests/${row.id}/approve`, { method: 'POST' })
        setRows(prev => prev.filter(r => r.id !== row.id));
    }

    function handleDeny(row) {
        // TODO: call your API here
        setRows(prev => prev.filter(r => r.id !== row.id));
    }

    const columns = [
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
    ];

    return (
        <DataTable
            columns={columns}
            data={rows}
            rowKey={(r) => r.id}
            stickyHeader
        />
    );
}
