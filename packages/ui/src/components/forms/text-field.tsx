import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import { FieldError, FieldHint, FieldLabel, fieldBoxStyles, getFieldState } from './field';

export type TextFieldProps = Omit<
  ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'prefix' | 'children' | 'aria-describedby'
> & {
  label: ReactNode;
  /** Help shown under the label, before the field, so that it is read before typing. */
  hint?: ReactNode;
  /** What to do to fix the value; marks the field as invalid. */
  error?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  icon?: IconName;
  /** A unit or a symbol before the value. */
  prefix?: string;
  /** A unit after the value ("units"). */
  suffix?: string;
};

export function TextField({
  label,
  hint,
  error,
  value,
  onChange,
  icon,
  prefix,
  suffix,
  disabled = false,
  required = false,
  id,
  className,
  ...props
}: TextFieldProps) {
  const invalid = Boolean(error);

  // Ark's Field links the label, the hint and the error to the input, and sets aria-invalid.
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

      <div
        className={fieldBoxStyles({
          state: getFieldState({ disabled, invalid }),
          className: 'flex h-control-md items-center gap-2 px-4',
        })}
      >
        {icon && <Icon name={icon} size="md" className="text-subtle" />}
        {prefix && <span className="text-body text-muted">{prefix}</span>}
        <Field.Input
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          // The box shows the focus ring (focus-within), so the input does not draw its own.
          className="h-full min-w-0 flex-1 bg-transparent text-body text-inherit placeholder:text-subtle focus-visible:outline-none"
        />
        {suffix && <span className="text-body text-muted">{suffix}</span>}
      </div>

      <FieldError>{error}</FieldError>
    </Field.Root>
  );
}
