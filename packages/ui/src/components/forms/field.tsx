import { Field as ArkField } from '@ark-ui/react/field';
import type { Override } from '@sel/utils';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from '../display/icon';

/**
 * Ark's Field links the label, the hint and the error to the control, and passes it disabled, invalid and required:
 * the control reads them from the context.
 */
function FieldRoot({
  className,
  ...props
}: Override<ComponentProps<'div'>, { invalid?: boolean; disabled?: boolean; required?: boolean }>) {
  return <ArkField.Root {...props} className={clsx('stack gap-2', className)} />;
}

/** The label and the hint, without the gap that separates them from the control. */
function FieldHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('stack', className)} />;
}

function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <ArkField.Label
      {...props}
      className={clsx('max-w-fit text-label text-default data-disabled:text-disabled', className)}
    />
  );
}

function FieldHint({ className, ...props }: ComponentProps<'span'>) {
  return <ArkField.HelperText {...props} className={clsx('text-body-sm text-muted', className)} />;
}

/** Only rendered while the field is invalid. */
function FieldError({ className, children, ...props }: ComponentProps<'span'>) {
  return (
    <ArkField.ErrorText
      {...props}
      className={clsx('row items-start gap-2 text-body-sm text-danger', className)}
    >
      <Icon name="error" size="md" />
      {children}
    </ArkField.ErrorText>
  );
}

export {
  FieldError as Error,
  FieldHeader as Header,
  FieldHint as Hint,
  FieldLabel as Label,
  FieldRoot as Root,
};
