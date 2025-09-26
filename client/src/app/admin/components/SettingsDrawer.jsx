'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Drawer from '../../components/drawer/Drawer';
import styles from './SettingsDrawer.module.css';
import { Button, ToggleButton } from '../../components/buttons/Buttons';

export default function SettingsDrawer({ open, onOpenChange }) {
	const [maintenance, setMaintenance] = useState(false); 
	const router = useRouter();

	useEffect(() => {
		fetch("/api/maintenance")
		  .then(res => res.json())
		  .then(data => setMaintenance(data.enabled))
		  .catch(err => console.error("Failed to fetch maintenance mode", err));
	  }, []);

	  const onSignOut = () => {
		try {
		  localStorage.removeItem("token");
		  localStorage.removeItem("user");
		  localStorage.removeItem("role");
		  window.dispatchEvent(new Event("authChanged"));
		} catch (err) {
		  console.error("Error during sign out:", err);
		}
		router.push("/login");
	  };

	const onShutDown = async (newState) => {
		setMaintenance(newState); 

		try {
			await fetch("/api/maintenance", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ enabled: newState }), 
			});
		} catch (err) {
			console.error("Failed to update maintenance mode", err); 
		}
	};

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
					pressed={maintenance} 
          			onPressedChange={onShutDown}
				/>
			</div>
    	</Drawer>
	);
}
