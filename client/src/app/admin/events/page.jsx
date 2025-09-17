'use client';
import React, { useState } from 'react';
import { Button, ToggleButton } from '../../components/buttons/Buttons';
import { Plus, Edit, Trash2, Check, ChevronRight } from 'react-feather';

export default function Events() {
  const sizes = ['small', 'medium', 'large'];
  const variants = ['primary', 'secondary', 'success', 'danger'];

  // Controlled toggles for each size
  const [toggles, setToggles] = useState({
    small: false,
    medium: true,
    large: false,
  });

  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <h1 style={{ margin: 0 }}>Buttons & Toggles — Demo</h1>

      {sizes.map((size) => (
        <section key={size} style={{ display: 'grid', gap: 12 }}>
          <h2 style={{ fontSize: 18, margin: '8px 0' }}>Size: {size}</h2>

          {/* Basic variants */}
          <div style={row}>
            {variants.map((variant) => (
              <Button key={variant} size={size} variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            ))}
          </div>

          {/* With icons */}
          <div style={row}>
            <Button size={size} variant="primary" iconLeft={<Plus/>}>
              New
            </Button>
            <Button size={size} variant="secondary" iconLeft={<Edit  />}>
              Edit
            </Button>
            <Button size={size} variant="success" iconRight={<Check />}>
              Save
            </Button>
            <Button size={size} variant="danger" iconRight={<Trash2 />}>
              Delete
            </Button>
            <Button size={size} variant="primary" iconLeft={<ChevronRight />}>
              Next
            </Button>
          </div>

          {/* Disabled */}
          <div style={row}>
            {variants.map((variant) => (
              <Button key={variant} size={size} variant={variant} disabled>
                Disabled {variant}
              </Button>
            ))}
          </div>

          {/* ToggleButton — uncontrolled */}
          <div style={row}>
            <label style={label}>
              <span style={labelText}>Uncontrolled</span>
              <ToggleButton size={size} aria-label={`Uncontrolled ${size} toggle`} />
            </label>

            {/* ToggleButton — controlled */}
            <ToggleButton
                size={size}
                pressed={toggles[size]}
                onPressedChange={(v) =>
                  setToggles((t) => ({ ...t, [size]: v }))
                }
                aria-label={`Controlled ${size} toggle`}
              />

            {/* Disabled toggle */}
            <label style={label}>
              <span style={labelText}>Disabled</span>
              <ToggleButton size={size} pressed={false} disabled aria-label={`Disabled ${size} toggle`} />
            </label>
          </div>
        </section>
      ))}
    </div>
  );
}

const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
};

const label = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 8px',
  borderRadius: 8,
  background: 'var(--surface, transparent)',
};

const labelText = { fontSize: 14, opacity: 0.85 };