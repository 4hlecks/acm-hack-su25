// This drawer creates/edits an Event. It is UI-only; it does not call the backend directly.
// It sends { owner (ObjectId), ownerText (label) } back to the parent so the parent
// can build the final payload for the API.

'use client';
import React from 'react';
import Drawer from '../../components/drawer/Drawer';
import UploadBox from '../../components/form/UploadBox';
import { Button } from '../../components/buttons/Buttons';
import {
    DateField,
    TimeField,
    TextField,
    TextAreaField,
    ComboBoxField,
} from '../../components/form/Form';
import { Calendar, Clock } from 'react-feather';

export default function EventDrawer({
    open,
    onOpenChange,
    initialEvent,          // { id?, name, owner, ownerName, date, startTime, endTime, location, description, category, coverUrl? }
    ownerOptions = [],     // [{ value: '<user _id>', label: '<club name>' }]
    categoryOptions = [],  // [{ value: 'GBM', label: 'GBM' }, ...] (values must match enum)
    onSave,
}) {
    const isEdit = Boolean(initialEvent?.id);

    // Media
    const [coverFile, setCoverFile] = React.useState(null);
    const [coverUrl, setCoverUrl] = React.useState(initialEvent?.coverUrl || null);

    // Core fields
    const [name, setName] = React.useState(initialEvent?.name || '');
    // Two states for owner: owner = _id, ownerText = label shown in the input
    const [owner, setOwner] = React.useState(initialEvent?.owner || '');
    const [ownerText, setOwnerText] = React.useState(initialEvent?.ownerName || '');
    const [date, setDate] = React.useState(initialEvent?.date || '');
    const [startTime, setStartTime] = React.useState(initialEvent?.startTime || '');
    const [endTime, setEndTime] = React.useState(initialEvent?.endTime || '');
    const [location, setLocation] = React.useState(initialEvent?.location || '');
    const [description, setDescription] = React.useState(initialEvent?.description || '');
    const [category, setCategory] = React.useState(initialEvent?.category || '');

    // Reset fields when opened or when a different event is passed
    React.useEffect(() => {
        setCoverFile(null);
        setCoverUrl(initialEvent?.coverUrl || null);

        setName(initialEvent?.name || '');
        setOwner(initialEvent?.owner || '');
        setOwnerText(initialEvent?.ownerName || '');
        setDate(initialEvent?.date || '');
        setStartTime(initialEvent?.startTime || '');
        setEndTime(initialEvent?.endTime || '');
        setLocation(initialEvent?.location || '');
        setDescription(initialEvent?.description || '');
        setCategory(initialEvent?.category || '');
    }, [initialEvent, open]);

    function handleSave() {
        onSave?.({
            id: initialEvent?.id,
            name,
            owner,       // _id (or '')
            ownerText,   // label (for fallback)
            date,
            startTime,
            endTime,
            location,
            description,
            category,
            coverFile,
            coverUrl,
        });
    }

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? 'Edit Event' : 'Create New Event'}
        >
            <UploadBox
                id="event-cover"
                value={coverFile}
                previewUrl={coverUrl}
                onChange={(fileOrNull) => {
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
                onChange={(e) => setName(e.target.value)}
                required
                layout="column"
                fieldWidth="100%"
                placeholder="e.g., ACM GBM: Fall Kickoff"
            />

            <ComboBoxField
                id="event-owner"
                label="Event Owner"
                value={ownerText}
                onChange={(v) => {
                    // typing changes the visible text and clears the selected id
                    setOwnerText(v);
                    setOwner('');
                }}
                onSelect={(opt) => {
                    // selecting sets both id and label
                    setOwner(opt.value);
                    setOwnerText(opt.label);
                }}
                options={ownerOptions}
                placeholder="Start typing a club or organizer…"
                layout="column"
                fieldWidth="100%"
                required
            />

            <DateField
                id="event-date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)} // 'YYYY-MM-DD'
                icon={<Calendar size={16} />}
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
                onSelect={(opt) => setCategory(opt.value)} // options use value=label (enum), so either label or value works
                options={categoryOptions}
                placeholder="Search or type a category…"
                layout="column"
                fieldWidth="100%"
            />

            <Button
                size="medium"
                width="fill"
                variant="secondary"
                onClick={handleSave}
            >
                {isEdit ? 'Save Changes' : 'Create Event'}
            </Button>
        </Drawer>
    );
}
