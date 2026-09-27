import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '../display/icon';

import { FieldError, FieldHint, FieldLabel, fieldBoxStyles, getFieldState } from './field';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<
  ComponentProps<'select'>,
  'value' | 'defaultValue' | 'onChange' | 'multiple' | 'children' | 'aria-describedby'
> & {
  label: ReactNode;
  /** Help shown under the label, before the field. */
  hint?: ReactNode;
  /** What to do to fix the choice; marks the field as invalid. */
  error?: ReactNode;
  options: SelectOption[];
  /** A first option that cannot be chosen ("Choose a category"), shown while value is null. */
  placeholder?: string;
  /** null while no option is chosen. */
  value: string | null;
  onChange: (value: string) => void;
};

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  id,
  className,
  ...props
}: SelectProps) {
  const invalid = Boolean(error);

  // A native <select> keeps the system picker on mobile. Ark's Field links the label, the hint and the error to it.
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

      <div className="relative">
        <Field.Select
          {...props}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={fieldBoxStyles({
            state: getFieldState({ disabled, invalid }),
            className: 'peer h-control-md w-full appearance-none truncate pr-12 pl-4 text-body',
          })}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field.Select>

        {/* Replaces the native arrow, hidden by appearance-none; clicks go through to the select. It flips while the
            picker is open (:open, not supported by every browser yet: the arrow then just stays down). */}
        <Icon
          name="chevron-down"
          size="md"
          className={clsx(
            'pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 transition peer-open:-scale-y-100',
            disabled ? 'text-disabled' : 'text-subtle',
          )}
        />
      </div>

      <FieldError>{error}</FieldError>
    </Field.Root>
  );
}
