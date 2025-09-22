'use client';
import React from 'react';
import Drawer from '../../components/drawer/Drawer';
import UploadBox from '../../components/form/UploadBox';
import { Button } from '../../components/buttons/Buttons';
import { TextField, ComboBoxField } from '../../components/form/Form';
import Spacer from '../../components/form/Spacer';

export default function UserDrawer({
    open,                   // controlled open state from parent (true = drawer visible)
    onOpenChange,           // setter from parent to open/close
    initialUser,            // seed data from parent: { id?, name, email, userType, avatarUrl? }
    userTypeOptions = [     // FALLBACK options for the "User Type" combobox.
                            // BACKEND: supply real options from API (e.g., GET /api/user-types) via parent prop.
        { value: 'student', label: 'Student' },
        { value: 'club', label: 'Club' },
        { value: 'admin', label: 'Admin' },
    ],
    onSave,                 // callback to parent when user clicks "Save".
                            // BACKEND: parent should handle POST/PUT/PATCH to your API, then close the drawer.
}) {
    // If we have an ID, we are editing; otherwise creating.
    const isEdit = Boolean(initialUser?.id);

    // LOCAL, TEMPORARY form state. These do not persist by themselves.
    // avatarFile -> a new File object chosen in this session (not uploaded yet)
    // avatarUrl  -> existing image URL from backend (used for preview)
    const [avatarFile, setAvatarFile] = React.useState(null);
    const [avatarUrl, setAvatarUrl] = React.useState(initialUser?.avatarUrl || null);

    const [userType, setUserType] = React.useState(initialUser?.userType || '');
    const [name, setName] = React.useState(initialUser?.name || '');
    const [email, setEmail] = React.useState(initialUser?.email || '');
    const [password, setPassword] = React.useState(''); // In edit mode, blank = "don’t change password".

    // Reset form whenever we open the drawer or the seed data changes.
    // Avoids showing stale info when switching from one user to another.
    React.useEffect(() => {
        setAvatarFile(null);
        setAvatarUrl(initialUser?.avatarUrl || null);
        setUserType(initialUser?.userType || '');
        setName(initialUser?.name || '');
        setEmail(initialUser?.email || '');
        setPassword('');
    }, [initialUser, open]);

    function handleSave() {
        // BACKEND FLOW (handled in parent via onSave):
        // 1) If avatarFile exists: upload it first (e.g., POST /api/uploads or S3 direct upload) -> get new `avatarUrl`.
        // 2) If isEdit: PATCH /api/admin/users/:id with { name, email, userType, ...(password ? { password } : {}), avatarUrl }
        //    Else (create): POST /api/admin/users with { name, email, userType, password, avatarUrl }
        // 3) On success: parent updates list state (optimistic or refetch) and closes drawer: onOpenChange(false)
        if (!name || !email || !userType || (!isEdit && !password)) {
            alert("All fields are required (except profile picture).");
            return;
        }

        onSave?.({
            id: initialUser?.id,
            userType,
            name,
            email,
            password: password || undefined,
            avatarFile,                      
            avatarUrl,                       
        });
    }

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? 'Edit User' : 'Create New User'} // Title switches based on presence of ID
        >
            <UploadBox
                id="user-avatar"
                value={avatarFile}
                previewUrl={avatarUrl}
                onChange={(fileOrNull) => {
                    // UI-only: we just hold a File for preview and pass it up on save.
                    // BACKEND: parent should upload file on save and replace avatarUrl with new URL.
                    setAvatarFile(fileOrNull);
                    if (!fileOrNull) setAvatarUrl(null); // clearing file removes preview
                }}
                height="10rem"
                labelEmptyPrimary="No picture selected"
                labelEmptySecondary="Upload a profile picture"
            />

            <ComboBoxField
                id="user-type"
                label="User Type"
                value={userType}
                onChange={(v) => setUserType(v)}           // `v` is raw input string while typing
                onSelect={(opt) => setUserType(opt.label)} // when an option is chosen, store its label (or opt.value if you prefer)
                options={userTypeOptions}
                placeholder="Select a user type…"
                layout="column"
                fieldWidth="100%"
                required
            />
            {/* NOTE: If backend expects a key (e.g., 'student') instead of the label ('Student'),
                     change onSelect to setUserType(opt.value) and send that value to API. */}

            <TextField
                id="user-name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)} // controlled input
                layout="column"
                fieldWidth="100%"
                required
            />

            <TextField
                id="user-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // controlled input
                layout="column"
                fieldWidth="100%"
                required
            />

            <TextField
                id="user-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // controlled input
                layout="column"
                fieldWidth="100%"
                placeholder={isEdit ? 'Leave blank to keep current password' : ''}
                required={!isEdit} // require password only when creating a new user
            />

            <Button
                size="medium"
                width="fill"
                variant="secondary"
                onClick={handleSave} // triggers parent onSave (see flow above)
            >
                {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
        </Drawer>
    );
}