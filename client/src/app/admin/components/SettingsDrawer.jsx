'use client';
import Drawer from '../../components/drawer/Drawer';

export default function SettingsDrawer({ open, onOpenChange }) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Settings">
            <p>Test</p>
        </Drawer>
    )
}