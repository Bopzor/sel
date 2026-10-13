import { Switch as ArkSwitch, useSwitchContext } from '@ark-ui/react/switch';
import { mergeProps } from '@ark-ui/react/utils';
import { type Override } from '@sel/utils';
import clsx from 'clsx';
import { cva } from 'cva';
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
    /** sm: a compact switch, for a setting shown next to the information it changes. */
    size?: 'sm' | 'md';
    value?: string;
    children?: never;
  }
>;

export function Switch({
  label,
  description,
  size = 'md',
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
    <ArkSwitch.Root {...rootProps} className={switchRootStyles({ size, className })}>
      <ArkSwitch.Control className={switchTrackStyles({ size })}>
        <ArkSwitch.Thumb className={switchThumbStyles({ size })}>
          <Icon name="check" size="sm" />
        </ArkSwitch.Thumb>
      </ArkSwitch.Control>

      {/* The label's first line is centered on the track. The description is outside Ark's label, which names the
          switch: it describes it instead. */}
      <span className={switchTextStyles({ size })}>
        <ArkSwitch.Label className={switchLabelStyles({ size })}>{label}</ArkSwitch.Label>
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
    <input
      {...mergeProps(inputProps, props)}
      {...(checked === undefined ? { defaultChecked } : { checked })}
    />
  );
}

// The hit area extends above and below the track, to 44px.
const switchRootStyles = cva(
  [
    'group relative row items-start after:absolute after:inset-x-0',
    'not-data-disabled:cursor-pointer data-disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        sm: 'gap-2 after:-inset-y-2.5',
        md: 'gap-3 after:-inset-y-1.5',
      },
    },
  },
);

// Styled from the attributes of Ark's parts, with states that exclude one another: disabled replaces the other
// colors, and only an enabled switch that is on reacts to the hover.
const switchTrackStyles = cva(
  [
    'row shrink-0 items-center rounded-full bg-switch-track transition data-focus-visible:focus-ring',
    'not-data-disabled:data-[state=checked]:bg-primary',
    'group-hover:not-data-disabled:data-[state=checked]:bg-primary-hover',
    'data-disabled:bg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'h-6 w-10 p-0.75',
        md: 'h-8 w-13 p-1',
      },
    },
  },
);

// The check mark is only visible when the switch is on.
const switchThumbStyles = cva(
  [
    'row items-center justify-center rounded-full bg-switch-thumb text-on-switch-thumb shadow-sm transition',
    'data-disabled:text-disabled',
    '*:opacity-0 *:transition data-[state=checked]:*:opacity-100',
  ],
  {
    variants: {
      size: {
        sm: 'size-4.5 *:size-3 data-[state=checked]:translate-x-4',
        md: 'size-6 data-[state=checked]:translate-x-5',
      },
    },
  },
);

const switchTextStyles = cva('stack min-w-0', {
  variants: {
    size: {
      sm: 'py-px',
      md: 'py-1',
    },
  },
});

const switchLabelStyles = cva('text-default data-disabled:text-disabled', {
  variants: {
    size: {
      sm: 'text-body-sm',
      md: 'text-label',
    },
  },
});
