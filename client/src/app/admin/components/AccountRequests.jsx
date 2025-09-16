'use client';
import React from 'react';
import DataTable from '../../components/datatable/DataTable';
import { Calendar, Tag, User, Mail, Zap } from 'react-feather';

// helper: "September 12, 2025"
function prettyDate(d) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }).format(d);
}

// mock rows to test sorting & layout (dates vary on purpose)
const sampleRequests = [
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
];

// handlers (wire these to your API later)
function approve(row) {
  // e.g., fetch(`/api/admin/account-requests/${row.id}/approve`, { method: 'POST' })
  console.log('Approve', row.id, row.name);
}
function deny(row) {
  console.log('Deny', row.id, row.name);
}

export default function AccountRequests() {
  const columns = [
    {
      key: 'requestDate',
      header: 'Request Date',
      icon: <Calendar/>,
      sortable: true,
      render: (row) => prettyDate(row.requestDate),
    },
    {
      key: 'type',            // assuming you meant "Type" (not "Table")
      header: 'Type',
      icon: <Tag/>,
      sortable: true,
    },
    {
      key: 'name',
      header: 'Name',
      icon: <User/>,
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email Address',
      icon: <Mail/>,
      sortable: true,
    },
    {
      key: 'action',
      header: 'Action',
      icon: <Zap/>,
      // keep it simple so you can style in your CSS module
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => approve(row)}
            style={{
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '0.375rem 0.75rem',
              background: 'white',
              cursor: 'pointer'
            }}
            aria-label={`Approve ${row.name}`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => deny(row)}
            style={{
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.375rem 0.75rem',
              background: 'white',
              cursor: 'pointer'
            }}
            aria-label={`Deny ${row.name}`}
          >
            Deny
          </button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <DataTable
        columns={columns}
        data={sampleRequests}
        rowKey={(r) => r.id}
        stickyHeader
      />
    </section>
  );
}
