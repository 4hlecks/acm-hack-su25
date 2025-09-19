// Page renders Events with search, table, and an EventDrawer for create/edit.
// This file currently uses mock state in the page. Comments below explain how to
// replace mock data and local updates with real backend calls (MERN).
//
// Backend hookup overview:
// 1) Data source:
//    - Replace the local `rows` state with results from your API.
//      Example server route: GET /api/admin/events?query=...&filterKey=...&limit=...&cursor=...
//    - Options (ownerOptions, categoryOptions) should also come from API endpoints:
//        GET /api/owners   -> [{ value: 'acm', label: 'ACM UCSD', id: '...' }, ...]
//        GET /api/categories -> [{ value: 'gbm', label: 'GBM', id: '...' }, ...]
//    - You can fetch on the server (turn this into a server component) or on the client
//      with SWR/React Query. If staying client-side, lift the fetch into a small hook/component.
//
// 2) Create/Edit/Delete:
//    - handleSave should call POST /api/admin/events for new items,
//      or PATCH /api/admin/events/:id for edits, then refresh or optimistically update local state.
//    - Delete button should call DELETE /api/admin/events/:id, then remove from local state.
//    - EventDrawer passes back both coverFile and coverUrl. If coverFile exists,
//      upload it first (POST /api/uploads or S3) to get a permanent URL, then include that
//      in your POST/PATCH payload.
//
// 3) Filtering and search:
//    - Currently done client-side with `visibleRows`. In production, push search/filter
//      to the API. On submit or on change, call GET /api/admin/events?query=...&filterKey=...,
//      then replace `rows` with the response.
//
// 4) Time and date:
//    - Keep date as 'YYYY-MM-DD' and time as 'HH:mm' on the client.
//      Convert to Date objects or UTC timestamps on the server to store in MongoDB.
//      When reading from DB, return ISO strings so the UI stays simple.
//
// 5) Auth:
//    - All /api/admin/* endpoints should be protected (middleware/session/JWT).
//      Ensure only admins can list/create/update/delete events.

'use client';
import styles from './page.module.css';
import React, { useMemo, useState } from 'react';
import SearchWithFilter from '../../components/form/SearchWithFilter';
import DataTable from '../../components/datatable/DataTable';
import EventDrawer from '../components/EventDrawer';
import { Button } from '../../components/buttons/Buttons';
import { PlusSquare, Edit, Trash2, Calendar as Cal, User, Tag, Command } from 'react-feather';

export default function Events() {
    // MOCK DATA:
    // Replace with API data. For client fetch, use useEffect or SWR/React Query to call:
    //   GET /api/admin/events
    // Then setRows(response.data).
    // For a server component approach, fetch on the server and pass as props to a client child.
    const [rows, setRows] = useState([
        {
            id: 'evt_001',
            date: '2025-09-28',
            startTime: '18:00',
            endTime: '20:00',
            ownerName: 'ACM UCSD',
            name: 'ACM GBM: Fall Kickoff',
            location: 'Price Center East Ballroom',
            description: 'Welcome back! Free pizza and project teams intro.',
            category: 'GBM',
            coverUrl: '',
        },
        {
            id: 'evt_002',
            date: '2025-10-03',
            startTime: '17:30',
            endTime: '19:00',
            ownerName: 'WIC (Women in Computing)',
            name: 'Resume Workshop',
            location: 'CSE 1202',
            description: 'Bring your resume; mentors will review.',
            category: 'Workshop',
            coverUrl: '',
        },
    ]);

    // Search/filter state stays in the page for now.
    // When moving to server-side filtering, send these as query params in GET /api/admin/events.
    const [query, setQuery] = useState('');
    const [filterKey, setFilterKey] = useState('name');

    function formatDateISOToPretty(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Table column config. When switching to server-side sorting, you can:
    //  - Add a sort param and fetch sorted results from the API.
    //  - Or keep client-side sorting in the DataTable for small datasets only.
    const columns = useMemo(() => ([
        {
            key: 'date',
            header: 'Date',
            icon: <Cal />,
            sortable: true,
            render: (r) => <span title={`${r.date} ${r.startTime ?? ''}`}>{formatDateISOToPretty(r.date)}</span>,
        },
        { key: 'ownerName', header: 'Owner', icon: <User />, sortable: true },
        { key: 'name', header: 'Name', icon: <Tag />, sortable: true },
        {
            key: 'action',
            header: 'Action',
            icon: <Command />,
            sortable: false,
            render: (r) => (
                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {/* Edit handler: swap with navigation to an edit page or open the drawer with data.
                       Backend flow in handleSave below. */}
                    <Button
                        size="small"
                        width="auto"
                        variant="primary"
                        iconLeft={<Edit />}
                        onClick={() => { setEditing(r); setDrawerOpen(true); }}
                    >
                        Edit
                    </Button>
                    {/* Delete handler: call DELETE /api/admin/events/:id, then remove from local state. */}
                    <Button
                        size="small"
                        width="auto"
                        variant="danger"
                        iconLeft={<Trash2 />}
                        onClick={() => {
                            if (!confirm(`Delete "${r.name}"?`)) return;
                            // Replace this with:
                            //   await fetch(`/api/admin/events/${r.id}`, { method: 'DELETE' })
                            //   if ok -> setRows(prev => prev.filter(x => x.id !== r.id));
                            setRows(prev => prev.filter(x => x.id !== r.id));
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ]), []);

    // Build filter options from columns. If you push filtering to the server,
    // send `filterKey` and `query` to GET /api/admin/events and setRows with the response.
    const filterOptions = useMemo(
        () => columns.filter(c => c.key !== 'action').map(c => ({ value: c.key, label: c.header })),
        [columns]
    );

    // Client-side filtering. Replace with server-side by calling:
    //   GET /api/admin/events?query=${query}&filterKey=${filterKey}
    // and using the response instead of local filtering.
    const visibleRows = useMemo(() => {
        if (!query) return rows;
        const q = query.toLowerCase();
        return rows.filter(r => String(r[filterKey] ?? '').toLowerCase().includes(q));
    }, [rows, query, filterKey]);

    // Drawer state and handlers. When connected to backend, handleSave should:
    //  - If file exists, upload cover first to get a permanent URL.
    //  - POST new event or PATCH existing one.
    //  - Refresh list or optimistically update state.
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    function handleCreate() {
        // Open empty drawer to create a new event
        setEditing(null);
        setDrawerOpen(true);
    }

    function handleSave(eventData) {
        // Replace local state updates with API calls:
        // if (eventData.id) {
        //     await fetch(`/api/admin/events/${eventData.id}`, {
        //         method: 'PATCH',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(eventDataWithUploadedCoverUrl),
        //     });
        // } else {
        //     await fetch(`/api/admin/events`, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(eventDataWithUploadedCoverUrl),
        //     });
        // }
        // Then either refetch events or update state below.
        setRows(prev => {
            if (eventData.id) {
                return prev.map(r => r.id === eventData.id ? { ...r, ...eventData } : r);
            }
            const id = `evt_${Date.now()}`;
            return [...prev, { id, ...eventData }];
        });
        setDrawerOpen(false);
    }

    return (
        <>
            <h1>Events</h1>

            {/* Top bar: Search + Create button.
               To use server-side search, call GET /api/admin/events with query/filterKey on submit/change
               and setRows with the response instead of using visibleRows. */}
            <div className={styles.top}>
                <SearchWithFilter
                    query={query}
                    onQueryChange={setQuery}
                    filterKey={filterKey}
                    onFilterKeyChange={setFilterKey}
                    filterOptions={filterOptions}
                    placeholder="Search events…"
                    onSubmit={() => {/* For server search, trigger fetch here */}}
                />
                <Button
                    size="medium"
                    width="auto"
                    variant="primary"
                    iconRight={<PlusSquare />}
                    onClick={handleCreate}
                >
                    Create Event
                </Button>
            </div>

            {/* DataTable consumes the rows to display.
               When switching to server-side pagination/sorting, either:
                 A) keep DataTable presentation-only and pass in server-sliced rows, or
                 B) extend DataTable to request more data (infinite scroll or numbered pages). */}
            <DataTable
                columns={columns}
                data={visibleRows}
                rowKey={(r) => r.id}
                stickyHeader
            />

            {/* EventDrawer handles the form UI.
               Provide real ownerOptions/categoryOptions from API:
                 GET /api/owners
                 GET /api/categories
               Then in onSave, do the POST/PATCH flow described above. */}
            <EventDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                initialEvent={editing}
                ownerOptions={[
                    // Replace with API results, e.g., owners.map(o => ({ value: o.id, label: o.name }))
                    { value: 'acm', label: 'ACM UCSD' },
                    { value: 'wic', label: 'WIC (Women in Computing)' },
                    { value: 'ds3', label: 'DS3 (Data Science Student Society)' },
                    { value: 'tbp', label: 'Tau Beta Pi' },
                ]}
                categoryOptions={[
                    // Replace with API results
                    { value: 'gbm', label: 'GBM' },
                    { value: 'workshop', label: 'Workshop' },
                    { value: 'fundraiser', label: 'Fundraiser' },
                    { value: 'free-food', label: 'Free Food' },
                    { value: 'career', label: 'Career' },
                ]}
                onSave={handleSave}
            />
        </>
    );
}
