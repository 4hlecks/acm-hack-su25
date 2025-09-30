'use client';
import React, { useId, useState } from 'react';
import styles from './AddTags.module.css';
import { Plus, X } from 'react-feather';

/**
 * Compact "input + attached button" control for adding tags.
 * No <form> — avoids nesting inside parent forms.
 *
 * Props:
 *  - placeholder?: string
 *  - onAdd: (tag: string) => void
 *  - className?: string
 */
export default function AddTags({ placeholder = 'Add tags...', onAdd, className = '' }) {
  const inputId = useId();
  const [value, setValue] = useState('');

  function commit() {
    const v = value.trim();
    if (!v) return;
    onAdd?.(v);
    setValue('');
  }

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.left}>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          aria-label="Add tag"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            title="Clear"
            onClick={() => setValue('')}
          >
            <X aria-hidden className={styles.icon} />
          </button>
        )}
      </div>

      <button
        type="button"
        className={styles.right}
        title="Add tag"
        aria-label="Add tag"
        onClick={commit}
      >
        <Plus className={styles.icon} aria-hidden />
      </button>
    </div>
  );
}
