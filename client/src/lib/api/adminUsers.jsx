// client/src/lib/api/adminUsers.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

function authHeaders() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminListClubs(params = {}) {
    const url = new URL(`${API_BASE}/api/admin/users`);
    const defaults = { role: 'club', approved: 'true', limit: '100', sort: 'name' };
    const final = { ...defaults, ...params };
    Object.entries(final).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to load clubs');
    return data;
}