'use client';
import React from 'react';
import Drawer from '../../../components/drawer/Drawer';
import UploadBox from '../../../components/form/UploadBox';
import { Button } from '../../../components/buttons/Buttons';
import { TextField } from '../../../components/form/Form';
import Spacer from '../../../components/form/Spacer';

export default function ProfileDrawer({
    open,                  // controlled "open" state from parent (true = drawer visible)
    onOpenChange,          // parent setter to open/close drawer
    initialProfile,        // seed data from parent: { id?, name?, avatarUrl? }
    onSave,                // callback to parent when user clicks "Save" — receives { id, name, avatarFile?, avatarUrl? }
}) {
    // If an id exists we consider it editing (title stays "Edit Profile" either way)
    const isEdit = Boolean(initialProfile?.id);

    // Local, temporary form state.
    // avatarFile = new file selected in this session (not uploaded yet)
    // avatarUrl  = existing URL (from server) to preview current avatar
    const [avatarFile, setAvatarFile] = React.useState(null);
    const [avatarUrl, setAvatarUrl] = React.useState(initialProfile?.avatarUrl || null);
    const [name, setName] = React.useState(initialProfile?.name || '');

    // Whenever the drawer opens or the seed data changes, reset the form.
    // This prevents stale values when switching between different users or reopening.
    React.useEffect(() => {
        setAvatarFile(null);
        setAvatarUrl(initialProfile?.avatarUrl || null);
        setName(initialProfile?.name || '');
    }, [initialProfile, open]);

    // Collect the form data and hand it to the parent.
    // Backend hookup (in parent onSave handler):
    //   1) If avatarFile exists, upload it (e.g., POST /api/uploads or S3 direct upload) to get a new avatarUrl.
    //   2) PATCH /api/me (or your user endpoint) with { name, avatarUrl }.
    //   3) On success, update parent profile state and close the drawer via onOpenChange(false).
    function handleSave() {
        onSave?.({
            id: initialProfile?.id,
            name,
            avatarFile,  // send the File so parent can upload if needed
            avatarUrl,   // keep existing URL; parent may override after upload
        });
    }

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Profile"
        >
            {/* UploadBox:
               - Shows a dashed dropzone when empty or an image preview if we have either a File or URL.
               - Returns a File (or null) via onChange; we do NOT upload here.
               - Parent onSave should handle uploading and then persist the returned URL. */}
            <UploadBox
                id="profile-avatar"
                value={avatarFile}
                previewUrl={avatarUrl}
                onChange={(fileOrNull) => {
                    setAvatarFile(fileOrNull);
                    // If user clears the image, also clear the preview URL.
                    if (!fileOrNull) setAvatarUrl(null);
                }}
                height="10rem"
                labelEmptyPrimary="No picture selected"
                labelEmptySecondary="Upload a profile picture"
            />

            {/* Simple controlled text input for the user's display name */}
            <TextField
                id="profile-name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                layout="column"
                fieldWidth="100%"
                required
            />

            {/* Spacer is optional — keep if you want extra breathing room above the button */}
            <Spacer size="1rem" />

            {/* Save button:
               - Calls handleSave -> parent onSave -> parent persists + closes drawer.
               - If you need loading/disabled state during save, lift that state to parent and pass props down. */}
            <Button
                size="medium"
                width="fill"
                variant="secondary"
                onClick={handleSave}
            >
                Save Changes
            </Button>
        </Drawer>
    );
}