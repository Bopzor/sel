import { Field } from '@ark-ui/react/field';
import { Switch as ArkSwitch } from '@ark-ui/react/switch';
import clsx from 'clsx';
import { cva } from 'cva';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '../display/icon';

import { FieldHint } from './field';

export type SwitchProps = Omit<
  ComponentProps<'input'>,
  'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children' | 'aria-describedby'
> & {
  /** The name of the setting. */
  label: ReactNode;
  /** What the setting concretely changes. */
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  id,
  className,
  ...props
}: SwitchProps) {
  // Ark's Field passes disabled to the switch, and links the description.
  return (
    <Field.Root id={id} disabled={disabled} className={className}>
      <ArkSwitch.Root
        checked={checked}
        onCheckedChange={(details) => onChange(details.checked)}
        className={clsx(
          // The hit area extends 6px above and below the 32px track, to 44px.
          'relative flex items-start gap-4 after:absolute after:inset-x-0 after:-inset-y-1.5',
          disabled ? 'cursor-not-allowed' : 'group cursor-pointer',
        )}
      >
        {/* The label's first line is centered on the track. The root is the <label>: the text uses Ark's switch
            label rather than FieldLabel, another <label>. */}
        <span className="flex min-w-0 flex-1 flex-col py-1">
          <ArkSwitch.Label className="text-label text-default data-disabled:text-disabled">
            {label}
          </ArkSwitch.Label>
          {description && <FieldHint>{description}</FieldHint>}
        </span>

        <ArkSwitch.Control className={switchTrackStyles({ state: getSwitchState({ checked, disabled }) })}>
          <ArkSwitch.Thumb
            className={clsx(
              'flex size-6 items-center justify-center rounded-full bg-switch-thumb shadow-sm transition',
              disabled ? 'text-disabled' : 'text-on-switch-thumb',
              checked && 'translate-x-5',
            )}
          >
            {checked && <Icon name="check" size="sm" />}
          </ArkSwitch.Thumb>
        </ArkSwitch.Control>

        {/* Ark renders a plain checkbox: the role makes screen readers announce "on" and "off". */}
        <ArkSwitch.HiddenInput {...props} role="switch" />
      </ArkSwitch.Root>
    </Field.Root>
  );
}

function getSwitchState({ checked, disabled }: { checked: boolean; disabled: boolean }) {
  if (disabled) return 'disabled';
  return checked ? 'on' : 'off';
}

const switchTrackStyles = cva(
  'flex h-8 w-13 shrink-0 items-center rounded-full p-1 transition data-focus-visible:focus-ring',
  {
    variants: {
      state: {
        off: 'bg-switch-track',
        on: 'bg-primary group-hover:bg-primary-hover',
        disabled: 'bg-disabled',
      },
    },
  },
);
