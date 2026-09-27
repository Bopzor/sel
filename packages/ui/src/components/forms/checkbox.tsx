import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';
import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import { cva } from 'cva';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '../display/icon';

import { FieldError, FieldHint } from './field';

export type CheckboxProps = Omit<
  ComponentProps<'input'>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'children' | 'aria-describedby'
> & {
  /** An affirmative sentence that describes the checked state. */
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** What to do to fix the answer ("Accept the terms to continue"); marks the box as invalid. */
  error?: ReactNode;
  value?: string;
};

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  error,
  disabled = false,
  required = false,
  name,
  form,
  value,
  id,
  className,
  ...props
}: CheckboxProps) {
  const invalid = Boolean(error);
  const state = getCheckboxState({ checked, disabled, invalid });

  // Ark's Field passes disabled, invalid and required to the checkbox, and links the description and the error.
  return (
    <Field.Root
      id={id}
      invalid={invalid}
      disabled={disabled}
      required={required}
      className={clsx('flex flex-col gap-3', className)}
    >
      <ArkCheckbox.Root
        checked={checked}
        onCheckedChange={(details) => onChange(details.checked === true)}
        name={name}
        form={form}
        value={value}
        className={clsx(
          // The hit area extends 10px above and below the 24px box, to 44px.
          'relative flex items-start gap-3 after:absolute after:inset-x-0 after:-inset-y-2.5',
          disabled ? 'cursor-not-allowed' : 'group cursor-pointer',
        )}
      >
        <ArkCheckbox.Control className={checkboxControlStyles({ state })}>
          <ArkCheckbox.Indicator>
            <Icon name="check" size="md" />
          </ArkCheckbox.Indicator>
        </ArkCheckbox.Control>

        {/* The root is the <label>: the text uses Ark's checkbox label rather than FieldLabel, another <label>. */}
        <span className="flex min-w-0 flex-col">
          <ArkCheckbox.Label className="text-label text-default data-disabled:text-disabled">
            {label}
          </ArkCheckbox.Label>
          {description && <FieldHint>{description}</FieldHint>}
        </span>

        {/* Ark links the description, but only a Field.Input receives the error's link. */}
        <Field.Context>
          {(field) => (
            <ArkCheckbox.HiddenInput
              {...props}
              aria-errormessage={field.invalid ? field.ids.errorText : undefined}
            />
          )}
        </Field.Context>
      </ArkCheckbox.Root>

      <FieldError>{error}</FieldError>
    </Field.Root>
  );
}

// A single state: disabled replaces the other colors, and a checked box is no longer invalid.
function getCheckboxState({
  checked,
  disabled,
  invalid,
}: {
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
}) {
  if (disabled) return 'disabled';
  if (checked) return 'checked';
  if (invalid) return 'invalid';
  return 'default';
}

const checkboxControlStyles = cva(
  'flex size-6 shrink-0 items-center justify-center rounded-xs border-2 transition data-focus-visible:focus-ring',
  {
    variants: {
      state: {
        default: 'border-strong bg-surface group-hover:border-strong-hover',
        checked: 'border-primary bg-primary text-on-primary',
        invalid: 'border-danger bg-surface',
        disabled: 'border-default bg-disabled text-disabled',
      },
    },
  },
);
