import { Field } from '@ark-ui/react/field';
import { cva } from 'cva';
import type { ReactNode } from 'react';

import { Icon } from '../display/icon';

// The parts of a form field, inside Ark's Field.Root, which links them to the control. Shared by the form
// components, not exported from the package.

export function FieldLabel({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <Field.Label onClick={onClick} className="text-label text-default data-disabled:text-disabled">
      {children}
    </Field.Label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <Field.HelperText className="text-body-sm text-muted">{children}</Field.HelperText>;
}

/** Only rendered while the field is invalid. */
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <Field.ErrorText className="flex items-start gap-2 text-body-sm text-danger">
      <Icon name="error" size="md" />
      {children}
    </Field.ErrorText>
  );
}

// The box of a text input (TextField's box, TextArea's textarea): border, background and focus ring.
export const fieldBoxStyles = cva('rounded-md border transition focus-within:focus-ring-field', {
  variants: {
    state: {
      default: 'border-strong bg-surface text-default hover:border-strong-hover',
      invalid: 'border-danger bg-surface text-default',
      disabled: 'cursor-not-allowed border-default bg-disabled text-disabled',
    },
  },
});

export function getFieldState({ disabled, invalid }: { disabled: boolean; invalid: boolean }) {
  if (disabled) return 'disabled';
  if (invalid) return 'invalid';
  return 'default';
}
