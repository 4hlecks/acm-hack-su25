'use client';

import styles from './NavBar.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * @param {'logo'|'link'|'button'} type
 * @param {string|function} action
 * @param {React.ReactNode} icon
 * @param {string} label
 * @param {boolean} pageActive  // exact-match for links
 * @param {boolean} active      // explicit active (use for button page tabs)
 */
export default function NavItem({
  type = 'link',
  action,
  icon,
  label,
  pageActive = false,
  active,                // NEW
  className = '',
  ...rest                // aria-*, data-*, role, etc.
}) {
  const pathname = usePathname();

  const content = (
    <>
      {icon}
      {label && (
        <span className={styles.navLabelWrapper}>
          <span className={styles.navLabel}>{label}</span>
        </span>
      )}
    </>
  );

  if (type === 'logo') {
    return (
      <Link
        href="/"
        className={`${styles.navLogo} ${className}`}
        aria-label="Home"
        title="Home"
        {...rest}
      >
        <span>current</span>
      </Link>
    );
  }

  if (type === 'link') {
    const href = typeof action === 'string' ? action : '#';
    const isActive = (() => {
      if (typeof active === 'boolean') return active; // explicit wins
      if (!href) return false;
      if (pageActive) return pathname === href;
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href + '/');
    })();

    return (
      <Link
        href={href}
        className={`${styles.navItem} ${isActive ? styles.activeLink : ''} ${className}`}
        data-active={isActive ? 'true' : 'false'}   // NEW
        aria-label={label}
        title={label}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  // button (use this for internal page tabs)
  const onClick = typeof action === 'function' ? action : undefined;
  const isActiveBtn = !!active;

  return (
    <button
      type="button"
      className={`${styles.navItem} ${isActiveBtn ? styles.activeLink : ''} ${className}`}
      data-active={isActiveBtn ? 'true' : 'false'}   // NEW
      onClick={onClick}
      aria-label={label}
      title={label}
      {...rest}
    >
      {content}
    </button>
  );
}
