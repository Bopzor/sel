import { Fieldset } from '@ark-ui/react/fieldset';
import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';
import clsx from 'clsx';
import { cva } from 'cva';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { Icon } from '../display/icon';

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<
  ComponentProps<'fieldset'>,
  'onChange' | 'children' | 'aria-describedby'
> & {
  /** The question, rendered as the legend. */
  label: ReactNode;
  options: RadioOption[];
  /** null while no option is chosen. */
  value: string | null;
  onChange: (value: string) => void;
  /** Help shown under the question, before the options. */
  hint?: ReactNode;
  /** What to do to fix the answer; marks the group as invalid. */
  error?: ReactNode;
  required?: boolean;
  /** cards: each option is a large card, for a structuring choice that needs an explanation. */
  variant?: 'list' | 'cards';
};

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  hint,
  error,
  required = false,
  disabled = false,
  name,
  form,
  variant = 'list',
  className,
  ...props
}: RadioGroupProps) {
  const invalid = Boolean(error);

  // Ark's Fieldset links the legend, the hint and the error to the group, and passes disabled and invalid to the
  // radio group, which is named by the legend.
  return (
    <Fieldset.Root {...props} invalid={invalid} disabled={disabled} className={clsx('min-w-0', className)}>
      {/* A legend is the fieldset's caption only as its first child, so the hint comes after it. */}
      <Fieldset.Legend className="text-label text-default data-disabled:text-disabled">
        {label}
      </Fieldset.Legend>
      {hint && <Fieldset.HelperText className="block text-body-sm text-muted">{hint}</Fieldset.HelperText>}

      <ArkRadioGroup.Root
        value={value}
        onValueChange={(details) => details.value !== null && onChange(details.value)}
        required={required}
        name={name}
        form={form}
        className={clsx('mt-4 flex flex-col', variant === 'cards' ? 'gap-3' : 'gap-4')}
      >
        {options.map((option) => (
          <RadioItem
            key={option.value}
            option={option}
            checked={option.value === value}
            disabled={disabled || option.disabled === true}
            invalid={invalid}
            variant={variant}
          />
        ))}
      </ArkRadioGroup.Root>

      <Fieldset.ErrorText className="mt-4 flex items-start gap-2 text-body-sm text-danger">
        <Icon name="error" size="md" />
        {error}
      </Fieldset.ErrorText>
    </Fieldset.Root>
  );
}

type RadioItemProps = {
  option: RadioOption;
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  variant: 'list' | 'cards';
};

function RadioItem({ option, checked, disabled, invalid, variant }: RadioItemProps) {
  const descriptionId = useId();
  const state = getRadioState({ checked, disabled, invalid });

  return (
    <ArkRadioGroup.Item
      value={option.value}
      disabled={option.disabled}
      className={radioItemStyles({ variant, state })}
    >
      <ArkRadioGroup.ItemControl className={radioControlStyles({ variant, state })}>
        {checked && <span className="size-3 rounded-full bg-current" />}
      </ArkRadioGroup.ItemControl>

      <span className="flex min-w-0 flex-col">
        <ArkRadioGroup.ItemText className={clsx('text-label', disabled ? 'text-disabled' : 'text-default')}>
          {option.label}
        </ArkRadioGroup.ItemText>
        {option.description && (
          <span id={descriptionId} className="text-body-sm text-muted">
            {option.description}
          </span>
        )}
      </span>

      <ArkRadioGroup.ItemHiddenInput aria-describedby={option.description ? descriptionId : undefined} />
    </ArkRadioGroup.Item>
  );
}

// A single state per option: disabled replaces the other colors, and a chosen option is no longer invalid.
function getRadioState({
  checked,
  disabled,
  invalid,
}: Pick<RadioItemProps, 'checked' | 'disabled' | 'invalid'>) {
  if (disabled) return 'disabled';
  if (checked) return 'checked';
  if (invalid) return 'invalid';
  return 'default';
}

const enabled = clsx('group cursor-pointer');

const radioItemStyles = cva('relative flex items-start gap-3', {
  variants: {
    variant: {
      // The hit area extends 10px above and below the 24px circle, to 44px.
      list: 'after:absolute after:inset-x-0 after:-inset-y-2.5',
      cards: 'rounded-md border p-4 transition data-focus-visible:focus-ring',
    },
    state: {
      default: enabled,
      checked: enabled,
      invalid: enabled,
      disabled: 'cursor-not-allowed',
    },
  },
  compoundVariants: [
    { variant: 'cards', state: 'default', class: 'border-strong bg-surface hover:bg-surface-hover' },
    {
      variant: 'cards',
      state: 'checked',
      class: 'border-primary bg-primary-subtle ring-1 ring-primary ring-inset',
    },
    { variant: 'cards', state: 'invalid', class: 'border-danger bg-surface hover:bg-surface-hover' },
    { variant: 'cards', state: 'disabled', class: 'border-default bg-disabled' },
  ],
});

const radioControlStyles = cva(
  'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition',
  {
    variants: {
      variant: {
        list: 'data-focus-visible:focus-ring',
        // The whole card shows the focus ring.
        cards: '',
      },
      state: {
        default: 'border-strong bg-surface group-hover:border-strong-hover',
        checked: 'border-primary bg-surface text-primary',
        invalid: 'border-danger bg-surface',
        disabled: 'border-default bg-disabled text-disabled',
      },
    },
  },
);
