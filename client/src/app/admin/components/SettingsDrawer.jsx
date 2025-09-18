'use client';
import { useState } from 'react';
import Drawer from '../../components/drawer/Drawer';
import UploadBox from '@/app/components/form/UploadBox';

// ⬇️ adjust the path to your Form.jsx file
import { TextField, SelectField, DateField, TimeField } from '../../components/form/Form';

import { MapPin, ChevronDown, Calendar, Clock } from 'react-feather';

export default function SettingsDrawer({ open, onOpenChange }) {
  // simple demo state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [cover, setCover] = useState(null);        // File | null
  const [existingUrl, setExistingUrl] = useState(''); // if editing, pass a URL here

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ title, category, date, start });
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Settings (Form Demo)">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>

        <UploadBox
            id="cover-photo"
            value={cover}
            previewUrl={existingUrl}
            onChange={(fileOrNull) => {
            // forward up to your parent / RHF / backend
            setCover(fileOrNull);
            // if you’re editing and user chooses a new file, you might clear existingUrl:
            if (fileOrNull instanceof File) {
                setExistingUrl('');
            }
            }}
            height="10rem"           // optional; e.g., '12rem', '240px'
        />
        {/* Column layout (label above field) */}
        <TextField
          id="event-title"
          label="Event Title"
          placeholder="ACM Hack Night"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          icon={<MapPin size={16} />}   // icon inside the field (right side)
        />

        {/* Row layout (label left, field right) */}
        <SelectField
          id="event-category"
          label="Category"
          layout="row"
          labelWidth="10rem"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          icon={<ChevronDown size={16} />}
        >
          <option value="">Select…</option>
          <option value="Fundraiser">Fundraiser</option>
          <option value="FreeFood">Free Food</option>
          <option value="GBM">GBM</option>
        </SelectField>

        {/* Date + Time side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <DateField
            id="event-date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar size={16} />}
          />
          <TimeField
            id="event-start"
            label="Start Time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            icon={<Clock size={16} />}
          />
        </div>

        {/* Actions (swap with your <Button> components if you want) */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </Drawer>
  );
}
