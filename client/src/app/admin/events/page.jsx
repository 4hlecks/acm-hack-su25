'use client';

import styles from './page.module.css';
import React, { useEffect, useMemo, useState } from 'react';
import SearchWithFilter from '../../components/form/SearchWithFilter';
import DataTable from '../../components/datatable/DataTable';
import EventDrawer from '../components/EventDrawer';
import { Button } from '../../components/buttons/Buttons';
import { PlusSquare, Edit, Trash2, Calendar as Cal, User, Tag, Command } from 'react-feather';

// API helpers
import {
  adminListEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
} from '../../../lib/api/adminEvents';
import { adminListClubs } from '../../../lib/api/adminUsers';

// ---------- helpers ----------
function toYYYYMMDD(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function eventToRow(ev) {
  return {
    id: ev._id,
    date: toYYYYMMDD(ev.date),
    startTime: ev.startTime || '',
    endTime: ev.endTime || '',
    ownerId: ev.eventOwner?._id || ev.eventOwner, // populated or raw id
    ownerName: ev.eventOwner?.name || '(unknown)',
    name: ev.eventTitle,
    location: ev.eventLocation,
    description: ev.eventDescription,
    category: ev.eventCategory,
    coverUrl: ev.coverPhoto || '',
  };
}

const isObjectId = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

function buildPayloadFromDrawer(d, ownerOptions) {
  const base = {
    eventTitle: d.name,
    eventDescription: d.description,
    date: d.date, // 'YYYY-MM-DD'
    startTime: d.startTime,
    endTime: d.endTime,
    eventLocation: d.location,
    eventCategory: d.category,
  };

  // 1) if drawer gave _id, take it
  if (d.owner && isObjectId(d.owner)) {
    base.eventOwner = d.owner;
    return base;
  }
  // 2) fallback: typed label -> resolve to id
  if (d.ownerText && Array.isArray(ownerOptions)) {
    const match = ownerOptions.find((o) => o.label === d.ownerText);
    if (match && isObjectId(match.value)) {
      base.eventOwner = match.value;
      return base;
    }
  }
  return base; // guard will catch missing eventOwner
}

// ---------- page ----------
export default function AdminEventsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [query, setQuery] = useState('');
  const [filterKey, setFilterKey] = useState('eventTitle');

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // owners
  const [ownerOptions, setOwnerOptions] = useState([]);

  // categories must match your Mongoose enum exactly
  const categoryOptions = useMemo(
    () => [
      { value: 'GBM', label: 'GBM' },
      { value: 'Workshop', label: 'Workshop' },
      { value: 'Fundraiser', label: 'Fundraiser' },
      { value: 'Free Food', label: 'Free Food' },
      { value: 'Networking', label: 'Networking' },
      { value: 'Panel', label: 'Panel' },
      { value: 'Social', label: 'Social' },
      { value: 'Study Jam', label: 'Study Jam' },
      { value: 'Game Night', label: 'Game Night' },
    ],
    []
  );

  // load events
  async function load({ page = 1, limit = 50 } = {}) {
    setLoading(true);
    try {
      const params = { page, limit };
      if (query) params.query = query;
      if (filterKey) params.filterKey = filterKey;
      const data = await adminListEvents(params); // { items, total, page, pageSize }
      setRows((data.items || []).map(eventToRow));
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  // initial: owners + events
  useEffect(() => {
    (async () => {
      try {
        const { items } = await adminListClubs(); // approved clubs
        setOwnerOptions((items || []).map((u) => ({ value: u._id, label: u.name })));
      } catch (e) {
        console.error(e);
        setOwnerOptions([]);
      }
      await load(); // <-- you were missing this, so events never populated
    })();
  }, []);

  // search submit
  async function handleSearchSubmit() {
    await load({ page: 1 });
  }

  // create
  function handleCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  // save
  async function handleSave(d) {
    try {
      console.log('drawer ->', d);
      const payload = buildPayloadFromDrawer(d, ownerOptions);

      if (!payload.eventOwner || !isObjectId(payload.eventOwner)) {
        alert('Please select an Event Owner (club) from the list.');
        return;
      }

      if (d.coverFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        fd.append('coverPhoto', d.coverFile);
        for (const [k, v] of fd.entries()) console.log('FD', k, v);

        if (d.id) {
          const updated = await adminUpdateEvent(d.id, fd);
          setRows((prev) => prev.map((r) => (r.id === d.id ? eventToRow(updated) : r)));
        } else {
          const created = await adminCreateEvent(fd);
          setRows((prev) => [eventToRow(created), ...prev]);
        }
      } else {
        console.log('JSON payload', payload);
        if (d.id) {
          const updated = await adminUpdateEvent(d.id, payload);
          setRows((prev) => prev.map((r) => (r.id === d.id ? eventToRow(updated) : r)));
        } else {
          const created = await adminCreateEvent(payload);
          setRows((prev) => [eventToRow(created), ...prev]);
        }
      }

      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Save failed');
    }
  }

  function formatDateISOToPretty(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const columns = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        icon: <Cal />,
        sortable: true,
        render: (r) => (
          <span title={`${r.date} ${r.startTime ?? ''}`}>
            {formatDateISOToPretty(r.date)}
          </span>
        ),
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
            <Button
              size="small"
              width="auto"
              variant="primary"
              iconLeft={<Edit />}
              onClick={() => {
                setEditing(r);
                setDrawerOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              width="auto"
              variant="danger"
              iconLeft={<Trash2 />}
              onClick={async () => {
                if (!confirm(`Delete "${r.name}"?`)) return;
                try {
                  await adminDeleteEvent(r.id);
                  setRows((prev) => prev.filter((x) => x.id !== r.id));
                } catch (e) {
                  alert(e.message || 'Delete failed');
                }
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const filterOptions = useMemo(
    () => [
      { value: 'eventTitle', label: 'Name' },
      { value: 'eventLocation', label: 'Location' },
      { value: 'eventDescription', label: 'Description' },
    ],
    []
  );

  return (
    <>
      <h1>Events</h1>

      <div className={styles.top}>
        <SearchWithFilter
          query={query}
          onQueryChange={setQuery}
          filterKey={filterKey}
          onFilterKeyChange={setFilterKey}
          filterOptions={filterOptions}
          placeholder="Search events…"
          onSubmit={handleSearchSubmit}
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

      
      {loading ? ( 
        <div style={{ padding: '1rem' }}>Loading…</div>
      ) : rows.length === 0 ? ( 
        <div style={{ padding: '1rem' }}>No events found.</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          stickyHeader
        />
      )}

      <EventDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialEvent={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                owner: editing.ownerId,       // _id for saving
                ownerName: editing.ownerName, // label for display
                date: editing.date,
                startTime: editing.startTime,
                endTime: editing.endTime,
                location: editing.location,
                description: editing.description,
                category: editing.category,
                coverUrl: editing.coverUrl,
              }
            : null
        }
        ownerOptions={ownerOptions}
        categoryOptions={categoryOptions}
        onSave={handleSave}
      />
    </>
  );
}
