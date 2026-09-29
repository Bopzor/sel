import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

import { fieldBoxStyles } from './field';

import type { Override } from '../../utils';

export type InputProps = Override<
  ComponentProps<'input'>,
  {
    children?: never;
    icon?: IconName;
    /** A unit or a symbol before the value. */
    prefix?: string;
    /** A unit after the value ("units"). */
    suffix?: string;
  }
>;

export function Input({ icon, prefix, suffix, className, ...props }: InputProps) {
  // Inside a Field, Ark's Field.Input gets its id, links and states from the context; the input's own props override
  // them. Outside, it is a bare input that needs an aria-label. The box follows the input's disabled and aria-invalid.
  return (
    <div className={clsx(fieldBoxStyles, 'flex h-control-md items-center gap-2 px-4', className)}>
      {icon && <Icon name={icon} size="md" className="text-subtle" />}
      {prefix && <span className="text-body text-muted">{prefix}</span>}
      <Field.Input
        {...props}
        // The box shows the focus ring (focus-within), so the input does not draw its own.
        className="h-full min-w-0 flex-1 bg-transparent text-body text-inherit placeholder:text-subtle focus-visible:outline-none"
      />
      {suffix && <span className="text-body text-muted">{suffix}</span>}
    </div>
  );
}
