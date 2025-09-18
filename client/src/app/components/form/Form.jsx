'use client';
import React, { forwardRef, useRef } from 'react';
import styles from './Form.module.css';

/** Base Form Field Wrapper: label + control + help/error */
export function FormField({
  id,
  label,
  required,
  help,
  error,
  layout = 'column',   // 'column' | 'row'
  fieldWidth = 'auto', // controls the width of the input/select area
  children,
}) {
  return (
    <div
      className={`${styles.field} ${error ? styles.hasError : ''}`}
      data-layout={layout}
      style={{ '--field-w': fieldWidth }}
    >
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span aria-hidden className={styles.req}>*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className={styles.error} role="alert" id={`${id}-error`}>{error}</p>
      ) : help ? (
        <p className={styles.help} id={`${id}-help`}>{help}</p>
      ) : null}
    </div>
  );
}

/* Low-level controls so ref reaches the real DOM elements */
export const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} className={styles.input} {...props} />;
});

export const SelectEl = forwardRef(function SelectEl({ children, ...props }, ref) {
  return (
    <select ref={ref} className={styles.select} {...props}>
      {children}
    </select>
  );
});

/** Text Field (icon rendered inside on the right; icon can open picker for date/time) */
export function TextField({
  id, label, icon, layout, fieldWidth, help, error, required, ...rest
}) {
  const inputRef = useRef(null);
  const isPicker = rest.type === 'date' || rest.type === 'time';

  const describedBy = [
    help ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean).join(' ') || undefined;

  function openNativePicker(e) {
    if (!isPicker) return;
    // avoid blurring the input before opening the picker
    e.preventDefault();
    const el = inputRef.current;
    if (el?.showPicker) {
      // Chrome/Edge/Safari 16.4+
      el.showPicker();
    } else {
      // Fallback: focus so the OS picker may appear on mobile,
      // or at least place caret for manual entry
      el?.focus();
    }
  }

  return (
    <FormField
      id={id}
      label={label}
      layout={layout}
      fieldWidth={fieldWidth}
      help={help}
      error={error}
      required={required}
    >
      <div className={styles.controlBox} data-has-icon={icon ? 'true' : undefined}>
        <Input
          ref={inputRef}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
        />
        {icon && (
          <span
            className={isPicker ? styles.iconBtn : styles.icon}
            aria-hidden
            onMouseDown={openNativePicker}
          >
            {icon}
          </span>
        )}
      </div>
    </FormField>
  );
}

/** Select Field (native arrow removed; custom icon shown) */
export function SelectField({
  id, label, icon, layout, fieldWidth, help, error, required, children, ...rest
}) {
  const describedBy = [
    help ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <FormField
      id={id}
      label={label}
      layout={layout}
      fieldWidth={fieldWidth}
      help={help}
      error={error}
      required={required}
    >
      <div className={styles.controlBox} data-has-icon={icon ? 'true' : undefined}>
        <SelectEl
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
        >
          {children}
        </SelectEl>
        {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
      </div>
    </FormField>
  );
}

/** Date & Time reuse TextField with type override (overlay method for the icon) */
export function DateField(props) { return <TextField {...props} type="date" />; }
export function TimeField(props) { return <TextField {...props} type="time" />; }
