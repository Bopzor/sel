import { Field as ArkField } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '../display/icon';

import type { Override } from '../../utils';

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

/** The label, the hint and the error around a control, stacked: the shortcut for FieldRoot and its parts. */
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
  return (
    <FieldRoot id={id} invalid={Boolean(error)} disabled={disabled} required={required} className={className}>
      <FieldHeader>
        <FieldLabel>{label}</FieldLabel>
        {hint && <FieldHint>{hint}</FieldHint>}
      </FieldHeader>

      {children}

      <FieldError>{error}</FieldError>
    </FieldRoot>
  );
}

export type FieldRootProps = Override<ComponentProps<typeof ArkField.Root>, { asChild?: never }>;

/**
 * Ark's Field links the label, the hint and the error to the control, and passes it disabled, invalid and required:
 * the control reads them from the context.
 */
export function FieldRoot({ className, ...props }: FieldRootProps) {
  return <ArkField.Root {...props} className={clsx('flex flex-col gap-2', className)} />;
}

export type FieldHeaderProps = ComponentProps<'div'>;

/** The label and the hint, without the gap that separates them from the control. */
export function FieldHeader({ className, ...props }: FieldHeaderProps) {
  return <div {...props} className={clsx('flex flex-col', className)} />;
}

export type FieldLabelProps = Override<ComponentProps<typeof ArkField.Label>, { asChild?: never }>;

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <ArkField.Label
      {...props}
      className={clsx('max-w-fit text-label text-default data-disabled:text-disabled', className)}
    />
  );
}

export type FieldHintProps = Override<ComponentProps<typeof ArkField.HelperText>, { asChild?: never }>;

export function FieldHint({ className, ...props }: FieldHintProps) {
  return <ArkField.HelperText {...props} className={clsx(hintStyles, className)} />;
}

export type FieldErrorProps = Override<ComponentProps<typeof ArkField.ErrorText>, { asChild?: never }>;

/** Only rendered while the field is invalid. */
export function FieldError({ className, children, ...props }: FieldErrorProps) {
  return (
    <ArkField.ErrorText {...props} className={clsx(errorStyles, className)}>
      <Icon name="error" size="md" />
      {children}
    </ArkField.ErrorText>
  );
}

// Shared with the parts of Fieldset.
export const hintStyles = clsx('text-body-sm text-muted');
export const errorStyles = clsx('flex items-start gap-2 text-body-sm text-danger');

// The box of a text control (Input, TextArea, Select): border, background and focus ring. It is styled from the
// attributes of the control it contains, so that it follows the control's final state: disabled replaces the other
// colors, and invalid replaces the hover and the focus ring's color.
export const fieldBoxStyles = clsx(
  'rounded-md border border-strong bg-surface text-default transition focus-within:focus-ring-field hover:border-strong-hover',
  'field-invalid:not-field-disabled:border-danger focus-within:field-invalid:not-field-disabled:focus-ring-field-invalid',
  'field-disabled:cursor-not-allowed field-disabled:border-default field-disabled:bg-disabled field-disabled:text-disabled',
);
