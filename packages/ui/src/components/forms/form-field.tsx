import type { ReactNode } from 'react';

import * as Field from './field';

type FormFieldProps = {
  label: ReactNode;
  /** Help shown under the label, before the control, so that it is read before typing. */
  hint?: ReactNode;
  /** What to do to fix the value; marks the control as invalid. */
  error?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** The control's id is derived from it. */
  id?: string;
  className?: string;
  /** A single control, such as an Input. */
  children: ReactNode;
};

/** The label, the hint and the error around a control, stacked: the shortcut for Field.Root and its parts. */
export function FormField({
  label,
  hint,
  error,
  disabled = false,
  required = false,
  id,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field.Root
      id={id}
      invalid={Boolean(error)}
      disabled={disabled}
      required={required}
      className={className}
    >
      <Field.Header>
        <Field.Label>{label}</Field.Label>
        {hint && <Field.Hint>{hint}</Field.Hint>}
      </Field.Header>

      {children}

      <Field.Error>{error}</Field.Error>
    </Field.Root>
  );
}
