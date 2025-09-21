// Users page with search, table, and a UserDrawer for create/edit.
// This version uses mock state in-page. Comments explain how to replace mocks with real backend calls.
//
// Backend hookup overview:
// 1) Data source:
//    - Replace local `rows` with data from your API.
//      Example endpoint: GET /api/admin/users?query=...&filterKey=...&limit=...&cursor=...
//    - Do the fetch either on the server (convert to a server component or load in a parent)
//      or on the client (SWR/React Query/useEffect).
//
// 2) Create/Edit/Delete:
//    - Create: POST /api/admin/users with { userType, name, email, password, avatarUrl? }.
//      If avatar file is chosen in the drawer, upload it first (e.g., POST /api/uploads) to get avatarUrl.
//    - Edit:   PATCH /api/admin/users/:id with fields that changed.
//      If password is blank from the drawer during edit, do not send it (keep existing).
//    - Delete: DELETE /api/admin/users/:id, then remove from table state or refetch.
//    - After any mutation, either refetch users from the API or optimistically update local state.
//
// 3) Search/filter:
//    - Currently handled on the client (`visibleRows`). For large datasets, move this to the API by sending
//      query and filterKey to GET /api/admin/users and using the server-filtered results.
//
// 4) IDs and values:
//    - The UserDrawer returns userType as whatever you store locally (label or value). If backend expects a stable key
//      like "student" instead of "Student", ensure the drawer uses opt.value and you send that to the API.
//
// 5) Auth and permissions:
//    - Protect all /api/admin/* routes. Only admins should be able to list/create/edit/delete users.
//
// 6) Pagination and sorting:
//    - For large lists, add server-side pagination (limit/cursor) and possibly server-side sorting.
//    - You can keep DataTable presentational and pass it already-sliced rows from the API.

'use client';
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import React, { useEffect, useMemo, useState } from 'react';
import SearchWithFilter from '../../components/form/SearchWithFilter';
import DataTable from '../../components/datatable/DataTable';
import UserDrawer from '../components/UserDrawer';
import { Button } from '../../components/buttons/Buttons';
import { PlusSquare, Users, Tag, Mail, Command, Edit, Trash2 } from 'react-feather';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

export default function UsersPage() {
    const router = useRouter();
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || role !== "admin") {
        router.push("/login");
      }
    }, [router]);

    const [rows, setRows] = useState([]);

    // Fetch real users 
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        fetch(`${API_BASE}/api/admin/users?role=club&approved=false`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(data => {
            if (data.items) {
              const mapped = data.items.map(u => ({
                id: u._id,
                type: u.role,
                name: u.name,
                email: u.email,
                avatarUrl: u.profilePic || "",
                approved: u.approved,
                role: u.role,
                _id: u._id,
              }));
              setRows(mapped);
            }
          })
          .catch(err => console.error("Error fetching users:", err));
      }, []);

    // Search / filter UI state.
    // For server-side search, send these to the API and replace visibleRows with the response.
    const [query, setQuery] = useState('');
    const [filterKey, setFilterKey] = useState('name');

    // Drawer state. `editing` is the selected user row for edit, or null for create.
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null => create mode

    // ---- Backend handlers ----
    async function approve(id) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/admin/account-requests/${id}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setRows(prev => prev.filter(u => u._id !== id && u.id !== id));
        }
    }

    async function deny(id) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/admin/account-requests/${id}/deny`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setRows(prev => prev.filter(u => u._id !== id && u.id !== id));
        }
    }

    async function deleteUser(id) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setRows(prev => prev.filter(u => u._id !== id && u.id !== id));
        }
    }

    // DataTable columns. If you add server-side sorting, pass sort info to your API instead
    // of relying on client-side sort for large datasets.
    const columns = useMemo(() => ([
        { key: 'type',  header: 'Type',          icon: <Users />,   sortable: true },
        { key: 'name',  header: 'Name',          icon: <Tag />,     sortable: true },
        { key: 'email', header: 'Email Address', icon: <Mail />,    sortable: true },
        {
            key: 'action',
            header: 'Action',
            icon: <Command />,
            sortable: false,
            render: (r) => (
                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    {/* Approve / Deny buttons (only show for pending clubs) */}
                    {r.role === 'club' && r.approved === false && (
                        <>
                            <Button
                                size="small"
                                width="auto"
                                variant="success"
                                onClick={() => approve(r._id || r.id)}
                            >
                                Approve
                            </Button>
                            <Button
                                size="small"
                                width="auto"
                                variant="danger"
                                onClick={() => deny(r._id || r.id)}
                            >
                                Deny
                            </Button>
                        </>
                    )}

                    {/* Edit: open drawer populated with this row's data.
                       Backend: in handleSave below, call PATCH /api/admin/users/:id. */}
                    <Button
                        size="small"
                        width="auto"
                        variant="primary"
                        iconLeft={<Edit />}
                        onClick={() => { setEditing(r); setDrawerOpen(true); }}
                    >
                        Edit
                    </Button>
                    {/* Delete: call DELETE /api/admin/users/:id, then remove locally or refetch. */}
                    <Button
                        size="small"
                        width="auto"
                        variant="danger"
                        iconLeft={<Trash2 />}
                        onClick={() => {
                            if (!confirm(`Delete user "${r.name}"?`)) return;
                            deleteUser(r._id || r.id);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ]), []);

    // Build filter options from columns for the SearchWithFilter component.
    const filterOptions = useMemo(
        () => columns.filter(c => c.key !== 'action').map(c => ({ value: c.key, label: c.header })),
        [columns]
    );

    // Client-side filtering for now. For server-side, call:
    //   GET /api/admin/users?query=${query}&filterKey=${filterKey}
    // and setRows(response.users), then pass rows directly to the table.
    const visibleRows = useMemo(() => {
        if (!query) return rows;
        const q = query.toLowerCase();
        return rows.filter(r => String(r[filterKey] ?? '').toLowerCase().includes(q));
    }, [rows, query, filterKey]);

    function handleCreate() {
        // Open the drawer in create mode
        setEditing(null);
        setDrawerOpen(true);
    }

    function handleSave(userData) {
        // Replace local state updates with API calls.
        // Example flow:
        // 1) If userData.avatarFile exists, upload to /api/uploads/avatar, get avatarUrl.
        // 2) If userData.id exists -> PATCH /api/admin/users/:id with { userType, name, email, ...(password?), avatarUrl? }
        //    Else -> POST /api/admin/users with { userType, name, email, password, avatarUrl? }
        // 3) On success:
        //    - Either refetch the list from GET /api/admin/users,
        //    - Or optimistically update `rows` like below.
        setRows(prev => {
            if (userData.id) {
                // Edit existing user locally. If server returns the updated user, prefer merging that response instead.
                return prev.map(u => u.id === userData.id ? {
                    ...u,
                    type: userData.userType ?? u.type,        // Ensure this matches backend schema (value vs label)
                    name: userData.name ?? u.name,
                    email: userData.email ?? u.email,
                    avatarUrl: userData.avatarUrl ?? u.avatarUrl,
                } : u);
            } else {
                // Create new user locally. Server should generate the id; here we mock one.
                const id = `usr_${Date.now()}`;
                return [
                    ...prev,
                    {
                        id,
                        type: userData.userType || '',
                        name: userData.name || '',
                        email: userData.email || '',
                        avatarUrl: userData.avatarUrl || '',
                    },
                ];
            }
        });
        // Close the drawer after save.
        setDrawerOpen(false);
    }

    return (
        <>
            <h1>Users</h1>

            {/* Top bar: search + create. For server-side search, fetch on submit/change and setRows. */}
            <div className={styles.top}>
                <SearchWithFilter
                    query={query}
                    onQueryChange={setQuery}
                    filterKey={filterKey}
                    onFilterKeyChange={setFilterKey}
                    filterOptions={filterOptions}
                    placeholder="Search users…"
                    onSubmit={() => { /* For server search, trigger fetch here. */ }}
                />
                <Button
                    size="medium"
                    width="auto"
                    variant="primary"
                    iconRight={<PlusSquare />}
                    onClick={handleCreate}
                >
                    Create User
                </Button>
            </div>

            {/* DataTable renders whatever rows you give it. Since it is the only component it can just fill up the whole page */}
            <DataTable
                columns={columns}
                data={visibleRows}
                rowKey={(r) => r._id || r.id}
                stickyHeader
            />

            {/* UserDrawer provides the form UI. Pass real options and wire onSave to POST/PATCH as noted above. */}
            <UserDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                initialUser={editing}
                userTypeOptions={[
                    // Replace with API results (stable keys as values):
                    // e.g., types.map(t => ({ value: t.key, label: t.name }))
                    { value: 'student',     label: 'Student' },
                    { value: 'org-officer', label: 'Org Officer' },
                    { value: 'faculty',     label: 'Faculty' },
                    { value: 'admin',       label: 'Admin' },
                ]}
                onSave={handleSave}
            />
        </>
    );
}
