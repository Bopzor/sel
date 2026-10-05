import { Switch as ArkSwitch, useSwitchContext } from '@ark-ui/react/switch';
import { mergeProps } from '@ark-ui/react/utils';
import { type Override } from '@sel/utils';
import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { definedAttributes } from '../../utils';
import { Icon } from '../display/icon';

type SwitchProps = Override<
  ComponentProps<'input'>,
  {
    type?: never;
    /** A switch takes effect immediately, so it is never invalid: a choice validated with a form is a Checkbox. */
    'aria-invalid'?: never;
    /** The name of the setting. */
    label: ReactNode;
    /** What the setting concretely changes. */
    description?: ReactNode;
    value?: string;
    children?: never;
  }
>;

export function Switch({
  label,
  description,
  checked,
  defaultChecked,
  disabled,
  required,
  name,
  form,
  value,
  'aria-describedby': ariaDescribedBy,
  className,
  ...props
}: SwitchProps) {
  const descriptionId = useId();

  // A prop left undefined is not passed to Ark, so that it does not erase a state that Ark reads elsewhere (the
  // disabled state of a <fieldset>, for example).
  const rootProps = definedAttributes({ checked, defaultChecked, disabled, required, name, form, value });

  // The root is the <label>: a click on the text toggles the switch.
  return (
    <ArkSwitch.Root
      {...rootProps}
      className={clsx(
        // The hit area extends 6px above and below the 32px track, to 44px.
        'group relative row items-start gap-3 after:absolute after:inset-x-0 after:-inset-y-1.5',
        'not-data-disabled:cursor-pointer data-disabled:cursor-not-allowed',
        className,
      )}
    >
      <ArkSwitch.Control className={switchTrackStyles}>
        <ArkSwitch.Thumb className={switchThumbStyles}>
          <Icon name="check" size="sm" />
        </ArkSwitch.Thumb>
      </ArkSwitch.Control>

      {/* The label's first line is centered on the track. The description is outside Ark's label, which names the
          switch: it describes it instead. */}
      <span className="stack min-w-0 py-1">
        <ArkSwitch.Label className="text-label text-default data-disabled:text-disabled">
          {label}
        </ArkSwitch.Label>
        {description && (
          <span id={descriptionId} className="text-body-sm text-muted">
            {description}
          </span>
        )}
      </span>

      {/* The native input, visually hidden, gets the input props (onChange, onBlur, ref). Ark renders a plain
          checkbox: the role makes screen readers announce "on" and "off". */}
      <SwitchHiddenInput
        {...props}
        checked={checked}
        role="switch"
        aria-describedby={clsx(Boolean(description) && descriptionId, ariaDescribedBy) || undefined}
      />
    </ArkSwitch.Root>
  );
}

// Replaces Ark's HiddenInput, which only sets defaultChecked: when the switch is controlled, React must control the
// input too, or a click that the owner rejects or reverts leaves the input out of sync, and React can miss the next
// change.
function SwitchHiddenInput({ checked, ...props }: ComponentProps<'input'>) {
  const { defaultChecked, ...inputProps } = useSwitchContext().getHiddenInputProps();

  return (
    <input {...mergeProps(inputProps, props)} {...(checked === undefined ? { defaultChecked } : { checked })} />
  );
}

// Styled from the attributes of Ark's parts, with states that exclude one another: disabled replaces the other
// colors, and only an enabled switch that is on reacts to the hover.
const switchTrackStyles = clsx(
  'row h-8 w-13 shrink-0 items-center rounded-full bg-switch-track p-1 transition data-focus-visible:focus-ring',
  'not-data-disabled:data-[state=checked]:bg-primary',
  'group-hover:not-data-disabled:data-[state=checked]:bg-primary-hover',
  'data-disabled:bg-disabled',
);

// The check mark is only visible when the switch is on.
const switchThumbStyles = clsx(
  'row size-6 items-center justify-center rounded-full bg-switch-thumb text-on-switch-thumb shadow-sm transition',
  'data-disabled:text-disabled data-[state=checked]:translate-x-5',
  '*:opacity-0 *:transition data-[state=checked]:*:opacity-100',
);
