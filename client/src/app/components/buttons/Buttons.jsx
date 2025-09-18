import styles from './Buttons.module.css';
import { useState } from 'react';

/** Base Button */
export function Button({
    children,               // children inside button
    size = 'medium',        // 'small' | 'medium' | 'large'
    width = 'auto',         // 'auto'  | 'fill' for drawers
    variant = 'primary',    // 'primary' | 'secondary' | 'success' | 'danger'
    iconLeft,
    iconRight,
    ...props                // onClick, type, disabled, etc.
}) {
    return (
        <button
            type="button"
            data-size={size}
            data-width={width}
            data-variant={variant}
            className={styles.button}
            {...props}
        >
            {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
            {children}
            {iconRight && <span className={styles.icon}>{iconRight}</span>}
        </button>
    );
}

/** Toggle Button */
export function ToggleButton({
    size = 'medium',        // 'small' | 'medium' | 'large'
    pressed,
    onPressedChange,
    ...props
}) {
    const isControlled = typeof pressed === 'boolean';
    const [internal, setInternal] = useState(false);
    const isOn = isControlled ? pressed : internal;

    function handleClick(e) {
        const next = !isOn;
        onPressedChange?.(next);
        if (!isControlled) setInternal(next);
        props.onClick?.(e);
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isOn}
            data-state={isOn ? 'on' : 'off'}
            data-size={size}
            className={styles.toggle}
            onClick={handleClick}
            {...props}
        >
            <span aria-hidden className={styles.thumb} />
        </button>
    )
}