// This drawer creates/edits an Event. It is UI-only; it does not call the backend directly.
// To hook up the backend, see the comments around:
//   - option sources for owner/category (fetch lists)
//   - file upload (coverFile -> upload -> coverUrl)
//   - saving (create vs edit API calls)
//   - date/time formatting you might need server-side

'use client';
import React from 'react';
import Drawer from '../../components/drawer/Drawer';
import UploadBox from '../../components/form/UploadBox';
import { Button } from '../../components/buttons/Buttons';
import { DateField, TimeField, TextField, TextAreaField, ComboBoxField } from '../../components/form/Form';
import { Calendar, Clock } from 'react-feather';

export default function EventDrawer({
  open,                        // controlled "open" flag from parent
  onOpenChange,                // parent setter to open/close the drawer
  initialEvent,                // seed data from parent: { id?, name, ownerName, date, startTime, endTime, location, description, category, coverUrl? }
  ownerOptions = [],           // BACKEND: pass real owner options from API (e.g., GET /api/clubs?active=true) as [{value,label}]
  categoryOptions = [],        // BACKEND: pass real categories from API (e.g., GET /api/event-categories)
  onSave,                      // callback to parent when Save is clicked — parent performs the API call
}) {
  const isEdit = Boolean(initialEvent?.id); // If we have an id, treat as "edit"; otherwise "create"
  const [coverFile, setCoverFile] = React.useState(null);                      // NEW file selected (not uploaded yet)
  const [coverUrl, setCoverUrl] = React.useState(initialEvent?.coverUrl || null); // Existing cover URL from backend (for preview)

  const [name, setName] = React.useState(initialEvent?.name || '');
  const [owner, setOwner] = React.useState(initialEvent?.ownerName || '');
  const [date, setDate] = React.useState(initialEvent?.date || '');           // Consider storing ISO 'YYYY-MM-DD' strings
  const [startTime, setStartTime] = React.useState(initialEvent?.startTime || ''); // Consider 24h 'HH:mm' for consistency
  const [endTime, setEndTime] = React.useState(initialEvent?.endTime || '');
  const [location, setLocation] = React.useState(initialEvent?.location || '');
  const [description, setDescription] = React.useState(initialEvent?.description || '');
  const [category, setCategory] = React.useState(initialEvent?.category || '');

  React.useEffect(() => {
    // Whenever the drawer opens or a different event is passed in, reset the local form state.
    // Avoids stale values when switching between events or reopening.
    setCoverFile(null);
    setCoverUrl(initialEvent?.coverUrl || null);
    setName(initialEvent?.name || '');
    setOwner(initialEvent?.ownerName || '');
    setDate(initialEvent?.date || '');
    setStartTime(initialEvent?.startTime || '');
    setEndTime(initialEvent?.endTime || '');
    setLocation(initialEvent?.location || '');
    setDescription(initialEvent?.description || '');
    setCategory(initialEvent?.category || '');
  }, [initialEvent, open]);

  function handleSave() {
    // BACKEND SAVE FLOW (handled in parent via onSave):
    // 1) If coverFile exists:
    //      - Upload it first (e.g., POST /api/uploads or S3 direct upload) to obtain a permanent coverUrl.
    //      - You can also do this in the parent before calling onSave, depending on your architecture.
    // 2) Build the payload your API expects.
    //      For CREATE (no id): POST /api/admin/events
    //      For UPDATE (has id): PATCH /api/admin/events/:id
    //    Suggested payload:
    //      {
    //        name,
    //        ownerName: owner,          // If your API expects an ID, set owner to opt.value instead of opt.label in onSelect.
    //        date, startTime, endTime,  // Keep formats consistent ('YYYY-MM-DD' and 'HH:mm'); convert to Date on server if needed.
    //        location,
    //        description,
    //        category,                  // Same note as owner: send an ID if backend expects IDs.
    //        coverUrl                   // URL from upload step or existing one if unchanged.
    //      }
    // 3) On success:
    //      - Parent updates its events list (optimistic update or refetch)
    //      - Parent closes the drawer: onOpenChange(false)
    onSave?.({
      id: initialEvent?.id,
      name,
      ownerName: owner,
      date, startTime, endTime,
      location,
      description,
      category,
      // We pass both the File and the existing URL so the parent can decide:
      // - If File exists, upload and replace coverUrl with the returned URL.
      // - Else, keep the existing coverUrl.
      coverFile,
      coverUrl,
    });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Event' : 'Create New Event'} // Title switches based on mode
    >
      <UploadBox
        id="event-cover"
        value={coverFile}                 // NEW file (if selected this session)
        previewUrl={coverUrl}            // Existing URL to preview current cover
        onChange={(fileOrNull) => {
          // UI-only: just hold the File for preview + pass upward on save.
          // BACKEND: The parent should upload this file, then persist the URL on the event record.
          setCoverFile(fileOrNull);
          if (!fileOrNull) setCoverUrl(null);
        }}
        height="12rem"
        labelEmptyPrimary="No Cover Selected"
        labelEmptySecondary="Upload a Cover Photo"
      />

      <TextField
        id="event-name"
        label="Event Name"
        value={name}
        onChange={(e) => setName(e.target.value)} // Controlled input
        required
        layout="column"
        fieldWidth="100%"
        placeholder="e.g., ACM GBM: Fall Kickoff"
      />

      <ComboBoxField
        id="event-owner"
        label="Event Owner"
        value={owner}
        onChange={(v) => setOwner(v)}           // Raw text while typing
        onSelect={(opt) => setOwner(opt.label)} // If backend expects an ID, store opt.value instead
        options={ownerOptions}                  // BACKEND: supply from API (clubs/orgs) via parent
        placeholder="Start typing a club or organizer…"
        layout="column"
        fieldWidth="100%"
        required
      />
      {/* NOTE: If your API expects ownerId (not name), change onSelect to setOwner(opt.value) and send that value in handleSave. */}

      <DateField
        id="event-date"
        label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)} // Typically 'YYYY-MM-DD'
        icon={<Calendar size={16} />}             // If your icon sizes are global, you can remove explicit sizes.
        layout="column"
        fieldWidth="100%"
        required
      />

      <TimeField
        id="event-start"
        label="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)} // 'HH:mm'
        icon={<Clock size={16} />}
        layout="column"
        fieldWidth="100%"
        required
      />

      <TimeField
        id="event-end"
        label="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        icon={<Clock size={16} />}
        layout="column"
        fieldWidth="100%"
        required
      />

      <TextField
        id="event-location"
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        layout="column"
        fieldWidth="100%"
        placeholder="e.g., Price Center Ballroom"
      />

      <TextAreaField
        id="event-description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        layout="column"
        fieldWidth="100%"
        placeholder="Add details attendees should know…"
      />

      <ComboBoxField
        id="event-category"
        label="Category"
        value={category}
        onChange={(v) => setCategory(v)}
        onSelect={(opt) => setCategory(opt.label)} // If backend expects categoryId, use opt.value here instead
        options={categoryOptions}                  // BACKEND: supply from API via parent
        placeholder="Search or type a category…"
        layout="column"
        fieldWidth="100%"
      />
      {/* TIP: Align your stored values with backend contracts:
              - if backend stores IDs for owner/category, keep IDs in state and display labels only in the UI. */}

      <Button
        size="medium"
        width="fill"
        variant="secondary"
        onClick={handleSave} // Triggers parent onSave which performs upload + POST/PATCH as needed
      >
        {isEdit ? 'Save Changes' : 'Create Event'}
      </Button>
    </Drawer>
  );
}
