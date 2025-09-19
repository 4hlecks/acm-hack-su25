import React, { forwardRef } from 'react';

// Base wrapper to mimic react-feather’s prop API
const IconBase = forwardRef(function IconBase(
  { size = 24, color = 'currentColor', strokeWidth = 2, className, children, ...rest },
  ref
) {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
});

export const SortDescend = forwardRef(function SortDescend(props, ref) {
  return (
    <IconBase ref={ref} {...props}>
      {/* your paths, no per-path stroke/strokeWidth so they inherit from <svg> */}
      <path d="M12 5H15" />
      <path d="M12 9L18 9" />
      <path d="M12 13L21 13" />
      <path d="M4 17L7 20L10 17" />
      <line x1="7" y1="18" x2="7" y2="4" />
    </IconBase>
  );
});

export const SortAscend = forwardRef(function SortAscend(props, ref) {
  return (
    <IconBase ref={ref} {...props}>
      <path d="M12 5L21 5" />
      <path d="M12 9L18 9" />
      <path d="M12 13L15 13" />
      <path d="M4 17L7 20L10 17" />
      <line x1="7" y1="18" x2="7" y2="4" />
    </IconBase>
  );
});