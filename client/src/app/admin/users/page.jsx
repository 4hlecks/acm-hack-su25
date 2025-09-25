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
import SearchWithFilter from '../../../components/form/SearchWithFilter';
import DataTable from '../../../components/datatable/DataTable';
import UserDrawer from '../components/UserDrawer';
import { Button } from '../../../components/buttons/Buttons';
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

    // Fetch all users
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${API_BASE}/api/admin/users`, {
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
                        type: u.role === "club"
                            ? "Club"
                            : u.role === "user"
                                ? "Student"
                                : u.role.charAt(0).toUpperCase() + u.role.slice(1),
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

    const [query, setQuery] = useState('');
    const [filterKey, setFilterKey] = useState('name');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);

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

    const columns = useMemo(() => ([
        { key: 'type', header: 'Type', icon: <Users />, sortable: true },
        { key: 'name', header: 'Name', icon: <Tag />, sortable: true },
        { key: 'email', header: 'Email Address', icon: <Mail />, sortable: true },
        {
            key: 'action',
            header: 'Action',
            icon: <Command />,
            sortable: false,
            render: (r) => (
                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
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
                    <Button
                        size="small"
                        width="auto"
                        variant="primary"
                        iconLeft={<Edit />}
                        onClick={() => { setEditing(r); setDrawerOpen(true); }}
                    >
                        Edit
                    </Button>
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

    const filterOptions = useMemo(
        () => [
            ...columns.filter(c => c.key !== 'action').map(c => ({ value: c.key, label: c.header })),
            { value: 'needsApproval', label: 'Needs Approval' },
        ],
        [columns]
    );

    const visibleRows = useMemo(() => {
        let filtered = rows;

        if (filterKey === 'needsApproval') {
            filtered = rows.filter(r => r.role === 'club' && r.approved === false);
        } else if (query) {
            const q = query.toLowerCase();
            filtered = rows.filter(r => String(r[filterKey] ?? '').toLowerCase().includes(q));
        }

        if (filterKey === 'type') {
            const order = { admin: 1, club: 2, user: 3 }; // user == Student
            return [...filtered].sort((a, b) => (order[a.role] || 99) - (order[b.role] || 99));
        }
        if (filterKey === 'name') {
            return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (filterKey === 'email') {
            return [...filtered].sort((a, b) => a.email.localeCompare(b.email));
        }

        return filtered;
    }, [rows, query, filterKey]);

    function handleCreate() {
        setEditing(null);
        setDrawerOpen(true);
    }

    async function handleSave(userData) {
        const token = localStorage.getItem("token");
    
        try {
            if (userData.id) {
                const res = await fetch(`${API_BASE}/api/admin/users/${userData.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: userData.name,
                        email: userData.email,
                        role: userData.role?.toLowerCase(),
                        password: userData.password,
                        approved: userData.role?.toLowerCase() === "user" ? true : userData.approved,
                      }),
                });
                if (!res.ok) throw new Error("Failed to update user");
            } else {
                const res = await fetch(`${API_BASE}/api/admin/users`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: userData.name,
                        email: userData.email,
                        role: userData.role?.toLowerCase(),
                        password: userData.password,
                        approved: userData.role?.toLowerCase() === "user" ? true : userData.approved,
                      }),
                  });
                
                  if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Create user failed:", res.status, errorText);
                    throw new Error("Failed to create user");
                  }
                }
    
            const refresh = await fetch(`${API_BASE}/api/admin/users`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await refresh.json();
            if (data.items) {
                const mapped = data.items.map(u => ({
                    id: u._id,
                    type: u.role === "user" ? "Student" : u.role.charAt(0).toUpperCase() + u.role.slice(1),
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    approved: u.approved,
                    _id: u._id,
                }));
                setRows(mapped);
            }
    
            setDrawerOpen(false);
        } catch (err) {
            console.error("Error saving user:", err);
            alert("Failed to save user");
        }
    }
    
    return (
        <>
          <h1>Users</h1>
          <div className={styles.top}>
            <SearchWithFilter
              query={query}
              onQueryChange={setQuery}
              filterKey={filterKey}
              onFilterKeyChange={setFilterKey}
              filterOptions={filterOptions}
              placeholder="Search users…"
              onSubmit={() => { }}
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
          <DataTable
            columns={columns}
            data={visibleRows}
            rowKey={(r) => r._id || r.id}
            stickyHeader
          />
      
          <UserDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            initialUser={editing}
            userTypeOptions={[
              { value: 'user', label: 'Student' },
              { value: 'club', label: 'Club' },
              { value: 'admin', label: 'Admin' },
            ]}
            onSave={handleSave}
          />
        </>
      );
      
}
