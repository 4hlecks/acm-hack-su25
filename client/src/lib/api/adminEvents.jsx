// client/src/lib/api/adminEvents.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

// Grab JWT from localStorage and set Authorization header
function authHeaders() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Server-side search/filter/sort
export async function adminListEvents(params = {}) {
    const url = new URL(`${API_BASE}/api/admin/events`);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to load admin events');
    return data;
}

// Create
export async function adminCreateEvent(formDataOrJson) {
    const isForm = formDataOrJson instanceof FormData;
    const res = await fetch(`${API_BASE}/api/admin/events`, {
        method: 'POST',
        headers: isForm ? authHeaders() : { ...authHeaders(), 'Content-Type': 'application/json'},
        body: isForm ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create event');
    return data.event;
}

// Update
export async function adminUpdateEvent(id, formDataOrJson) {
    const isForm = formDataOrJson instanceof FormData;
    const res = await fetch(`${API_BASE}/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: isForm ? authHeaders() : { ...authHeaders(), 'Content-Type': 'application/json'},
        body: isForm ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update event');
    return data.event;
}

// Delete
export async function adminDeleteEvent(id) {
    const res = await fetch(`${API_BASE}/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to delete event');
    return true;
}