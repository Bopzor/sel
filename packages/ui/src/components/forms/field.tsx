import { Field as ArkField } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../display/icon';

export type FieldProps = {
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

/** The label, the hint and the error around a control, stacked. */
export function Field({
  label,
  hint,
  error,
  disabled = false,
  required = false,
  id,
  className,
  children,
}: FieldProps) {
  // Ark's Field links the label, the hint and the error to the control, and passes it disabled, invalid and
  // required: the control reads them from the context.
  return (
    <ArkField.Root
      id={id}
      invalid={Boolean(error)}
      disabled={disabled}
      required={required}
      className={clsx('flex flex-col gap-2', className)}
    >
      <div className="flex flex-col">
        <FieldLabel>{label}</FieldLabel>
        {hint && <FieldHint>{hint}</FieldHint>}
      </div>

      {children}

      <FieldError>{error}</FieldError>
    </ArkField.Root>
  );
}

// The parts of a form field, inside Ark's Field.Root, which links them to the control.

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <ArkField.Label
      className={clsx('max-w-fit text-label text-default data-disabled:text-disabled', className)}
      {...props}
    />
  );
}

function FieldHint({ className, ...props }: React.ComponentProps<'span'>) {
  return <ArkField.HelperText className={clsx('text-body-sm text-muted', className)} {...props} />;
}

/** Only rendered while the field is invalid. */
function FieldError({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <ArkField.ErrorText
      className={clsx('flex items-start gap-2 text-body-sm text-danger', className)}
      {...props}
    >
      <Icon name="error" size="md" />
      {children}
    </ArkField.ErrorText>
  );
}

// The box of a text control (Input, TextArea, Select): border, background and focus ring. It is styled from the
// attributes of the control it contains, so that it follows the control's final state: disabled replaces the other
// colors, and invalid replaces the hover and the focus ring's color.
export const fieldBoxStyles = clsx(
  'rounded-md border border-strong bg-surface text-default transition focus-within:focus-ring-field hover:border-strong-hover',
  'field-invalid:not-field-disabled:border-danger focus-within:field-invalid:not-field-disabled:focus-ring-field-invalid',
  'field-disabled:cursor-not-allowed field-disabled:border-default field-disabled:bg-disabled field-disabled:text-disabled',
);
