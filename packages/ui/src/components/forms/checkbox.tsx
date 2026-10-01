import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';
import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { definedAttributes, type Override } from '../../utils';
import { Icon } from '../display/icon';

type CheckboxProps = Override<
  ComponentProps<'input'>,
  {
    type?: never;
    'aria-invalid'?: never;
    /** When a required box is not checked. */
    invalid?: boolean;
    /** An affirmative sentence that describes the checked state. */
    label: ReactNode;
    /** A consequence or a detail, under the label. */
    description?: ReactNode;
    value?: string;
    children?: never;
  }
>;

export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  disabled,
  required,
  name,
  form,
  value,
  invalid,
  'aria-describedby': ariaDescribedBy,
  className,
  ...props
}: CheckboxProps) {
  const descriptionId = useId();

  // A prop left undefined is not passed to Ark, so that it does not erase a state that Ark reads elsewhere (the
  // disabled state of a <fieldset>, for example).
  const rootProps = definedAttributes({
    checked,
    defaultChecked,
    disabled,
    required,
    invalid,
    name,
    form,
    value,
  });

  // The root is the <label>: a click on the text checks the box.
  return (
    <ArkCheckbox.Root
      {...rootProps}
      className={clsx(
        // The hit area extends 10px above and below the 24px box, to 44px.
        'group relative row items-start gap-3 not-data-disabled:cursor-pointer after:absolute after:inset-x-0 after:-inset-y-2.5 data-disabled:cursor-not-allowed',
        className,
      )}
    >
      <ArkCheckbox.Control className={checkboxControlStyles}>
        <ArkCheckbox.Indicator>
          <Icon name="check" size="md" />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>

      {/* The description is outside Ark's label, which names the checkbox: it describes it instead. */}
      <span className="stack min-w-0">
        <ArkCheckbox.Label className="text-label text-default data-disabled:text-disabled">
          {label}
        </ArkCheckbox.Label>
        {description && (
          <span id={descriptionId} className="text-body-sm text-muted">
            {description}
          </span>
        )}
      </span>

      {/* The native input, visually hidden, gets the input props (onChange, onBlur, ref). */}
      <ArkCheckbox.HiddenInput
        {...props}
        aria-describedby={clsx(Boolean(description) && descriptionId, ariaDescribedBy) || undefined}
      />
    </ArkCheckbox.Root>
  );
}

// Styled from the attributes of Ark's control, with states that exclude one another: disabled replaces the other
// colors, a checked box is no longer invalid, and only an unchecked valid box reacts to the hover.
const checkboxControlStyles = clsx(
  'row size-6 shrink-0 items-center justify-center rounded-xs border-2 border-strong bg-surface transition data-focus-visible:focus-ring',
  'group-hover:not-data-disabled:not-data-invalid:data-[state=unchecked]:border-strong-hover',
  'not-data-disabled:data-invalid:data-[state=unchecked]:border-danger',
  'not-data-disabled:data-[state=checked]:border-primary not-data-disabled:data-[state=checked]:bg-primary not-data-disabled:data-[state=checked]:text-on-primary',
  'data-disabled:border-default data-disabled:bg-disabled data-disabled:text-disabled',
);
