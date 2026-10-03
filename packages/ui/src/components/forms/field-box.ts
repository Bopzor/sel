import clsx from 'clsx';

// The box of a text control (Input, TextArea, Select): border, background and focus ring. It is styled from the
// attributes of the control it contains, so that it follows the control's final state: disabled replaces the other
// colors, and invalid replaces the hover and the focus ring's color.
export const fieldBoxStyles = clsx(
  'rounded-md border border-strong bg-surface text-default transition focus-within:focus-ring-field hover:border-strong-hover',
  'field-invalid:not-field-disabled:border-danger focus-within:field-invalid:not-field-disabled:focus-ring-field-invalid',
  'field-disabled:cursor-not-allowed field-disabled:border-default field-disabled:bg-disabled field-disabled:text-disabled',
);
