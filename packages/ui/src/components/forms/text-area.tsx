import { Field } from '@ark-ui/react/field';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { fieldBoxStyles } from './field';

import type { Override } from '../../utils';

export type TextAreaProps = Override<
  ComponentProps<'textarea'>,
  {
    children?: never;
  }
>;

export function TextArea({ rows = 4, className, ...props }: TextAreaProps) {
  // Inside a Field, Ark's Field.Textarea gets its id, links and states from the context; the textarea's own props
  // override them. Outside, it is a bare textarea that needs an aria-label. The box follows the textarea's disabled
  // and aria-invalid.
  return (
    <div className={clsx(fieldBoxStyles, className)}>
      <Field.Textarea
        {...props}
        rows={rows}
        // The box shows the focus ring (focus-within), so the textarea does not draw its own.
        className="block w-full resize-y bg-transparent px-4 py-3 text-body text-inherit placeholder:text-subtle focus-visible:outline-none"
      />
    </div>
  );
}
