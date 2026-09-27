import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { FieldError, FieldHint, FieldLabel, fieldBoxStyles, getFieldState } from './field';

export type TextAreaProps = Omit<
  ComponentProps<'textarea'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'aria-describedby'
> & {
  label: ReactNode;
  /** Help shown under the label, before the field, so that it is read before typing. */
  hint?: ReactNode;
  /** What to do to fix the value; marks the field as invalid. */
  error?: ReactNode;
  value: string;
  onChange: (value: string) => void;
};

export function TextArea({
  label,
  hint,
  error,
  value,
  onChange,
  rows = 4,
  disabled = false,
  required = false,
  id,
  className,
  ...props
}: TextAreaProps) {
  const invalid = Boolean(error);

  // Ark's Field links the label, the hint and the error to the textarea, and sets aria-invalid.
  return (
    <Field.Root
      id={id}
      invalid={invalid}
      disabled={disabled}
      required={required}
      className={clsx('flex flex-col gap-2', className)}
    >
      <div className="flex flex-col">
        <FieldLabel>{label}</FieldLabel>
        {hint && <FieldHint>{hint}</FieldHint>}
      </div>

      <Field.Textarea
        {...props}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldBoxStyles({
          state: getFieldState({ disabled, invalid }),
          className: 'resize-y px-4 py-3 text-body placeholder:text-subtle',
        })}
      />

      <FieldError>{error}</FieldError>
    </Field.Root>
  );
}
