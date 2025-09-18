'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import styles from './UploadBox.module.css';

// adjust this import path to your Buttons file
import { Button } from '../buttons/Buttons';
import { Image as ImageIcon, Trash2 } from 'react-feather';

/**
 * UploadBox
 * Props:
 * - id: string (for input association)
 * - value?: File | null         // controlled file value (optional)
 * - previewUrl?: string         // optional existing URL (e.g., from backend)
 * - onChange?: (fileOrNull) => void
 * - height?: string             // CSS size; default '10rem' (e.g. '12rem', '200px')
 * - accept?: string             // default 'image/*'
 * - labelEmptyPrimary?: string  // default "No File Chosen"
 * - labelEmptySecondary?: string// default "Upload a Cover Photo"
 */
export default function UploadBox({
  id = 'upload',
  value = null,
  previewUrl,
  onChange,
  height = '10rem',
  accept = 'image/*',
  labelEmptyPrimary = 'No File Chosen',
  labelEmptySecondary = 'Upload a Cover Photo',
}) {
  const inputRef = useRef(null);

  // Build a preview URL when a File is provided
  const objectUrl = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => {
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  const displayUrl = previewUrl || objectUrl;
  const hasImage = Boolean(displayUrl);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onChange?.(file);
    // allow re-selecting the same file later
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove() {
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={styles.root} style={{ '--upload-h': height }}>
      {/* Hidden file input */}
      <input
        id={id}
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />

      {!hasImage ? (
        // Empty state: dashed box
        <button
          type="button"
          className={styles.dropzone}
          onClick={openPicker}
          aria-labelledby={`${id}-empty-primary ${id}-empty-secondary`}
        >
          <span id={`${id}-empty-primary`} className={styles.emptyPrimary}>
            {labelEmptyPrimary}
          </span>
          <span id={`${id}-empty-secondary`} className={styles.emptySecondary}>
            {labelEmptySecondary}
          </span>
        </button>
      ) : (
        // Preview + actions
        <div className={styles.previewStack}>
          <div className={styles.previewWrap}>
            <img className={styles.preview} src={displayUrl} alt="Cover photo preview" />
          </div>

          <div className={styles.actions}>
            <Button
              size="medium"
              variant="primary"
              width="fill"
              iconLeft={<ImageIcon/>}
              onClick={openPicker}
            >
              Change
            </Button>
            <Button
              size="medium"
              variant="danger"
              width="fill"
              iconLeft={<Trash2/>}
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
