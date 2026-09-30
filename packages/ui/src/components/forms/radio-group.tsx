import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';
import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { definedAttributes, type Override } from '../../utils';

export type RadioGroupProps = Override<
  ComponentProps<'div'>,
  {
    /** null while no option is chosen. */
    value?: string | null;
    defaultValue?: string | null;
    onChange?: (value: string) => void;
    name?: string;
    form?: string;
    disabled?: boolean;
    required?: boolean;
    /** Marks every option as invalid. */
    'aria-invalid'?: boolean;
    /** Radios or RadioCards. */
    children: ReactNode;
  }
>;

/** The options of a single choice: Radios or RadioCards. The question and the error go on a fieldset around it. */
export function RadioGroup({
  value,
  defaultValue,
  onChange,
  name,
  form,
  disabled,
  required,
  'aria-invalid': invalid,
  className,
  ...props
}: RadioGroupProps) {
  // A prop left undefined is not passed to Ark, so that it does not erase the state of a fieldset around the group.
  // Inside Ark's Fieldset, the group is named by the legend and takes the fieldset's disabled and invalid states.
  const rootProps = definedAttributes({ value, defaultValue, name, form, disabled, required, invalid });

  return (
    <ArkRadioGroup.Root
      {...rootProps}
      {...props}
      onValueChange={(details) => details.value !== null && onChange?.(details.value)}
      className={clsx('flex flex-col gap-4', className)}
    />
  );
}

export type RadioProps = Override<
  ComponentProps<typeof ArkRadioGroup.Item>,
  {
    asChild?: never;
    children?: never;
    value: string;
    label: ReactNode;
    /** A consequence or a detail, under the label. */
    description?: ReactNode;
  }
>;

/** A 24px radio button and its label, both clickable. */
export function Radio({ label, description, className, ...props }: RadioProps) {
  return (
    <ArkRadioGroup.Item
      {...props}
      className={clsx(
        // The hit area extends 10px above and below the 24px circle, to 44px.
        'group relative flex items-start gap-3 after:absolute after:inset-x-0 after:-inset-y-2.5',
        'not-data-disabled:cursor-pointer data-disabled:cursor-not-allowed',
        className,
      )}
    >
      <RadioItemContent
        label={label}
        description={description}
        controlClassName="data-focus-visible:focus-ring"
      />
    </ArkRadioGroup.Item>
  );
}

/** An option as a large card, for a structuring choice that needs an explanation. */
export function RadioCard({ label, description, className, ...props }: RadioProps) {
  return (
    <ArkRadioGroup.Item {...props} className={clsx(radioCardStyles, className)}>
      {/* The whole card shows the focus ring. */}
      <RadioItemContent label={label} description={description} />
    </ArkRadioGroup.Item>
  );
}

type RadioItemContentProps = Pick<RadioProps, 'label' | 'description'> & { controlClassName?: string };

function RadioItemContent({ label, description, controlClassName }: RadioItemContentProps) {
  const descriptionId = useId();

  return (
    <>
      <ArkRadioGroup.ItemControl className={clsx(radioControlStyles, controlClassName)} />

      {/* The description is outside Ark's item text, which names the radio button: it describes it instead. */}
      <span className="flex min-w-0 flex-col">
        <ArkRadioGroup.ItemText className="text-label text-default data-disabled:text-disabled">
          {label}
        </ArkRadioGroup.ItemText>
        {description && (
          <span id={descriptionId} className="text-body-sm text-muted">
            {description}
          </span>
        )}
      </span>

      <ArkRadioGroup.ItemHiddenInput aria-describedby={description ? descriptionId : undefined} />
    </>
  );
}

// Styled from the attributes of Ark's item parts, with states that exclude one another: disabled replaces the other
// colors, a chosen option is no longer invalid, and only an unchosen valid option reacts to the hover. The dot is the
// ::after, shown when the option is chosen.
const radioControlStyles = clsx(
  'flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-strong bg-surface transition',
  'after:size-3 after:scale-0 after:rounded-full after:bg-current after:transition data-[state=checked]:after:scale-100',
  'group-hover:not-data-disabled:not-data-invalid:data-[state=unchecked]:border-strong-hover',
  'not-data-disabled:data-invalid:data-[state=unchecked]:border-danger',
  'not-data-disabled:data-[state=checked]:border-primary not-data-disabled:data-[state=checked]:text-primary',
  'data-disabled:border-default data-disabled:bg-disabled data-disabled:text-disabled',
);

const radioCardStyles = clsx(
  'group flex items-start gap-3 rounded-md border border-strong bg-surface p-4 transition data-focus-visible:focus-ring',
  'not-data-disabled:cursor-pointer data-disabled:cursor-not-allowed',
  'hover:not-data-disabled:data-[state=unchecked]:bg-surface-hover',
  'not-data-disabled:data-invalid:data-[state=unchecked]:border-danger',
  'not-data-disabled:data-[state=checked]:border-primary not-data-disabled:data-[state=checked]:bg-primary-subtle not-data-disabled:data-[state=checked]:ring-1 not-data-disabled:data-[state=checked]:ring-primary not-data-disabled:data-[state=checked]:ring-inset',
  'data-disabled:border-default data-disabled:bg-disabled',
);
