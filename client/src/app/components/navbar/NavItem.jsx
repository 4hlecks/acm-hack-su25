'use client'

import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation item for the navigation bar
 * @param {'logo' | 'link' | 'button'} type
 * @param {string | function} action - href for links, onClick for buttons
 * @param {React.ReactNode} icon
 * @param {string} label
 * @param {boolean} pageActive - if true, require exact match for active state
 * @returns 
 */
export default function NavItem({
    type = 'link',
    action,
    icon,
    label,
    pageActive = false,
    className = '',
    ...rest // extra HTML props (aria-*, data-*, etc.)
}) {
    const pathname = usePathname();

    const content = (
        <>
            {icon}
            {label && <span className={styles.navLabel}>{label}</span>}
        </>
    );

    if (type === 'logo') {
        return (
            <Link
                href={'/'}
                className={`${styles.navLogo} ${className}`}
                aria-label={'Home'}
                title={'Home'}
                {...rest} // as, replace, scroll, prefetch, etc.
            >
                <span>current</span>
            </Link>
        )
    }
    else if (type === 'link') {
        const href = typeof action === 'string' ? action : '#';

        // Active logic: exact match or startsWith (for nested routes)
        const isActive = pageActive
            ? pathname === href
            : href === '/'
                ? pathname === '/'
                : pathname === href || pathname.startsWith(href + '/');

        return (
            <Link
                href={href}
                className={`${styles.navItem} ${isActive ? styles.activeLink : ''} ${className}`}
                aria-label={label}
                title={label}
                {...rest} // as, replace, scroll, prefetch, etc.
            >
                {content}
            </Link>
        )
    }
    else if (type === 'button') {
        const onClick = typeof action === 'function' ? action : undefined;
        return (
            <button
                type="button"
                className={`${styles.navItem} ${className}`}
                onClick={onClick}
                aria-label={label}
                title={label}
                {...rest} // aria-controls, data-*
            >
                {content}
            </button>
        )
    }
}