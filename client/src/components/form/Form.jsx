'use client';
import React, { forwardRef, useRef, useState } from 'react';
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
    e.preventDefault(); // avoid blur before opening
    const el = inputRef.current;
    if (el?.showPicker) el.showPicker();
    else el?.focus();
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
      <div
        className={styles.controlBox}
        data-has-icon={icon ? 'true' : undefined}
        data-invalid={error ? 'true' : undefined}
      >
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

/** Select Field (supports placeholder; drops bottom radii only while native menu is visible) */
export function SelectField({
  id,
  label,
  icon,
  layout,
  fieldWidth,
  help,
  error,
  required,
  placeholder,          // pass a string to auto-inject a disabled empty option
  children,
  onChange,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const justOpenedByPointer = React.useRef(false);

  const describedBy = [
    help ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean).join(' ') || undefined;

  // Pointer interaction:
  // - If closed → open and mark "just opened" to ignore the immediate click.
  // - If open   → proactively close so corners restore when menu collapses.
  function handleMouseDown() {
    if (!open) {
      setOpen(true);
      justOpenedByPointer.current = true;
    } else {
      setOpen(false);
      justOpenedByPointer.current = false;
    }
  }

  // Click fires after mousedown; ignore the first click that opened the menu.
  // If it wasn't a "just opened" click and we're still open, close now (covers
  // browsers that don't blur when the menu collapses on the second click).
  function handleClick() {
    if (justOpenedByPointer.current) {
      justOpenedByPointer.current = false;
      return;
    }
    if (open) setOpen(false);
  }

  // Keyboard: Enter/Space/ArrowDown likely opens; Tab should close before moving focus.
  function handleKeyDown(e) {
    const k = e.key;
    if (k === 'Enter' || k === ' ' || k === 'ArrowDown') {
      setOpen(true);
    } else if (k === 'Tab') {
      setOpen(false);
    }
  }

  // Fallback close on keyup Tab as well (some UA quirks).
  function handleKeyUp(e) {
    if (e.key === 'Tab') setOpen(false);
  }

  // Close on blur and on value change, too.
  function handleBlur() {
    setOpen(false);
    justOpenedByPointer.current = false;
  }
  function handleChange(e) {
    setOpen(false);
    justOpenedByPointer.current = false;
    onChange?.(e);
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
      <div
        className={styles.controlBox}
        data-has-icon={icon ? 'true' : undefined}
        data-open={open ? 'true' : undefined}
        data-invalid={error ? 'true' : undefined}
      >
        <SelectEl
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          onChange={handleChange}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </SelectEl>
        {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
      </div>
    </FormField>
  );
}

/** Date & Time reuse TextField with type override */
export function DateField(props) { return <TextField {...props} type="date" />; }
export function TimeField(props) { return <TextField {...props} type="time" />; }

/** TextArea Field (multiline descriptions) */
export function TextAreaField({
  id, label, layout, fieldWidth, help, error, required, rows = 4, ...rest
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
      <div
        className={styles.controlBox}
        data-invalid={error ? 'true' : undefined}
      >
        <textarea
          id={id}
          className={styles.textarea}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
    </FormField>
  );
}

/**
 * ComboBoxField (unchanged from your last version)
 */
export function ComboBoxField({
  id,
  label,
  options = [],
  value = '',
  onChange,
  onSelect,
  placeholder = '',
  layout,
  fieldWidth,
  help,
  error,
  required,
  editable = true,              // ✅ NEW: disable text manipulation when false
  icon = null,                  // ✅ NEW: optional right-side icon
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const inputRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const listRef = React.useRef(null);
  const listId = `${id}-listbox`;

  const pointerIntent = React.useRef(false);
  const armPointerIntent = () => { pointerIntent.current = true; };
  const disarmPointerIntentSoon = () => { setTimeout(() => { pointerIntent.current = false; }, 0); };

  // If not editable, don't filter; otherwise filter by typed value.
  const filtered = React.useMemo(() => {
    if (!editable) return options;
    const q = (value || '').toLowerCase().trim();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, value, editable]);

  React.useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const barH = wrapRef.current.offsetHeight || 0;
    const listH = open && listRef.current ? listRef.current.offsetHeight : 0;
    wrapRef.current.style.setProperty('--combo-shadow-h', `${barH + listH}px`);
  }, [open, filtered.length]);

  function commitOption(opt) {
    onSelect?.(opt);
    // For editable=false, parent typically controls "value" to be the label
    // For editable=true, we keep using label text as before
    onChange?.(opt.label);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e) {
    // Open on arrows if closed
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setOpen(true);
      setActiveIdx(0);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) commitOption(opt);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // When not editable, ignore typing but allow focus to open via pointer.
  function handleInputChange(e) {
    if (!editable) return;            // 🔒 block text manipulation
    onChange?.(e.target.value);
    setOpen(true);
    setActiveIdx(0);
  }

  // Clicking the icon should toggle/open the list without focusing input first.
  function handleIconMouseDown(e) {
    e.preventDefault();
    setOpen(o => !o);
    // if opening, set a sensible active index
    if (!open) setActiveIdx(0);
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
      <div
        ref={wrapRef}
        className={`${styles.combo} ${open ? styles.comboOpen : ''}`}
        data-has-icon={icon ? 'true' : undefined}
        data-editable={editable ? 'true' : 'false'}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <div
          className={styles.comboBar}
          onPointerDown={armPointerIntent}
          onPointerUp={disarmPointerIntentSoon}
        >
          <input
            ref={inputRef}
            id={id}
            className={styles.input}
            type="text"
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            readOnly={!editable}               // ✅ non-editable like a select
            onFocus={() => {
              if (pointerIntent.current) setOpen(true);
            }}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete={editable ? 'list' : 'none'}
            aria-invalid={!!error}
          />

          {/* ✅ Optional right-side icon that toggles menu */}
          {icon && (
            <span
              className={styles.iconBtn}
              aria-hidden
              onMouseDown={handleIconMouseDown}
              title="Toggle"
            >
              {icon}
            </span>
          )}
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={styles.comboList}
          data-open={open ? 'true' : undefined}
        >
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.comboOption} ${i === activeIdx ? styles.comboOptionActive : ''}`}
              onMouseDown={(e) => { e.preventDefault(); commitOption(opt); }}
            >
              {opt.label}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className={`${styles.comboOption} ${styles.comboEmpty}`} aria-disabled="true">
              No matches
            </li>
          )}
        </ul>
      </div>
    </FormField>
  );
}
