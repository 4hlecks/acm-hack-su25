'use client'
import { Dialog } from '@base-ui-components/react/dialog';
import { X } from 'react-feather';
import styles from './Drawer.module.css';


export default function Drawer({ open, onOpenChange, title, children }) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.backdrop} />

                <Dialog.Popup className={styles.drawer} aria-modal="true">
                    <header className={styles.header}>
                        <Dialog.Title className={styles.title}>
                            {title}
                        </Dialog.Title>
                        <Dialog.Close className={styles.closeButton} aria-label="Close">
                            <X className={styles.closeIcon} />
                        </Dialog.Close>
                    </header>

                    <section className={styles.body}>
                        {children}
                    </section>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}