import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from '../display/icon';

import { fieldBoxStyles } from './field';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<ComponentProps<'select'>, 'multiple' | 'children'> & {
  options: SelectOption[];
  /** A first option that cannot be chosen ("Choose a category"), shown while the value is an empty string. */
  placeholder?: string;
};

export function Select({ options, placeholder, value, defaultValue, className, ...props }: SelectProps) {
  // Uncontrolled, the browser would pick the first option that is not disabled: the placeholder is picked explicitly.
  const initialValue =
    value === undefined && defaultValue === undefined && placeholder !== undefined ? '' : defaultValue;

  // A native <select> keeps the system picker on mobile. Inside a Field, Ark's Field.Select gets its id, links and
  // states from the context; the select's own props override them. Outside, it is a bare select that needs an
  // aria-label. The box follows the select's disabled and aria-invalid.
  return (
    <div className={clsx(fieldBoxStyles, 'relative h-control-md', className)}>
      <Field.Select
        {...props}
        value={value}
        defaultValue={initialValue}
        // The box shows the focus ring (focus-within), so the select does not draw its own.
        className="peer size-full appearance-none truncate bg-transparent pr-12 pl-4 text-body text-inherit focus-visible:outline-none"
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
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-subtle transition peer-open:-scale-y-100 peer-disabled:text-disabled"
      />
    </div>
  );
}
