'use client';
import React from 'react';
import Drawer from '../../../components/drawer/Drawer';
import { Button } from '../../../components/buttons/Buttons';
import { TextField, ComboBoxField } from '../../../components/form/Form';

export default function UserDrawer({
  open,
  onOpenChange,
  initialUser,
  userTypeOptions = [
    { value: 'user',  label: 'Student' },
    { value: 'club',  label: 'Club'    },
    { value: 'admin', label: 'Admin'   },
  ],
  onSave,
}) {
  const isEdit = Boolean(initialUser?.id);

  // helper to find option by backend value
  const findOption = React.useCallback(
    (val) => userTypeOptions.find((o) => o.value === (val || '').toLowerCase()) || null,
    [userTypeOptions]
  );

  // keep backend value and UI text separately
  const initOpt = findOption(initialUser?.role);
  const [userTypeValue, setUserTypeValue] = React.useState(initOpt?.value || '');  // "user" | "club" | "admin"
  const [userTypeInput, setUserTypeInput] = React.useState(initOpt?.label || '');  // "Student" | "Club" | "Admin"

  const [name, setName] = React.useState(initialUser?.name || '');
  const [email, setEmail] = React.useState(initialUser?.email || '');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    const opt = findOption(initialUser?.role);
    setUserTypeValue(opt?.value || '');
    setUserTypeInput(opt?.label || '');
    setName(initialUser?.name || '');
    setEmail(initialUser?.email || '');
    setPassword('');
  }, [initialUser, open, findOption]);

  function handleSave() {
    if (!name || !email || !userTypeValue || (!isEdit && !password)) {
      alert('All fields are required (except password when editing).');
      return;
    }

    onSave?.({
      id: initialUser?.id,
      role: userTypeValue,              // backend-safe: "user" | "club" | "admin"
      name,
      email,
      password: password || undefined,  
      // Auto-approve rules:
      approved: ['user', 'admin'].includes(userTypeValue)
        ? true
        : (initialUser?.approved ?? false),
    });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit User' : 'Create New User'}
    >
      <ComboBoxField
        id="user-type"
        label="User Type"
        // IMPORTANT: value is the **visible text** of the input
        value={userTypeInput}
        onChange={(text) => setUserTypeInput(text)} // allow typing/backspace
        onSelect={(opt) => {
          // when user picks an option, set both the backend value and the visible label
          setUserTypeValue(opt.value);
          setUserTypeInput(opt.label);
        }}
        options={userTypeOptions}
        placeholder="Select a user type…"
        layout="column"
        fieldWidth="100%"
        required
      />

      <TextField
        id="user-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        layout="column"
        fieldWidth="100%"
        required
      />

      <TextField
        id="user-email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        layout="column"
        fieldWidth="100%"
        required
      />

      <TextField
        id="user-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        layout="column"
        fieldWidth="100%"
        placeholder={isEdit ? 'Leave blank to keep current password' : ''}
        required={!isEdit}
      />

      <Button size="medium" width="fill" variant="secondary" onClick={handleSave}>
        {isEdit ? 'Save Changes' : 'Create User'}
      </Button>
    </Drawer>
  );
}
