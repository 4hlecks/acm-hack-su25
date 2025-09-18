'use client';
import { useState } from 'react';
import Drawer from '../../components/drawer/Drawer';
import styles from './SettingsDrawer.module.css';
import { Button, ToggleButton } from '../../components/buttons/Buttons';

export default function SettingsDrawer({ open, onOpenChange }) {
	const onSignOut = () => {
		window.alert("TO DO: Sign Out");
	}

	const onShutDown = () => {
		window.alert("TO DO: Maintenance Mode");
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange} title="Settings">
			<div className={styles.row}>
				<h3 className={styles.label}>Account</h3>
				<Button
					size="medium"
					width="auto"
					variant="primary"
					onClick={onSignOut}
				>
					Sign Out
				</Button>
			</div>
			<div className={styles.row}>
				<h3 className={styles.label}>Maintenance Mode</h3>
				<ToggleButton 
					size="medium"
					onPressedChange={onShutDown}
				/>
			</div>
    	</Drawer>
	);
}
