import { Fieldset as ArkFieldset } from '@ark-ui/react/fieldset';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from '../display/icon';

import type { Override } from '../../utils';

/**
 * A group of controls that answer one question: a RadioGroup, several Checkboxes. Ark's Fieldset links the legend,
 * the hint and the error to the group, and passes it disabled and invalid.
 */
export function Fieldset({
  className,
  ...props
}: Override<ComponentProps<'fieldset'>, { invalid?: boolean }>) {
  return <ArkFieldset.Root {...props} className={clsx('stack min-w-0 gap-4', className)} />;
}

/** The legend and the hint, without the gap that separates them from the controls. */
export function FieldsetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('stack', className)} />;
}

/** The question. It names the fieldset through Ark's aria-labelledby, so it may be inside a FieldsetHeader. */
export function FieldsetLegend({ className, ...props }: ComponentProps<'legend'>) {
  return (
    <ArkFieldset.Legend
      {...props}
      className={clsx('text-label text-default data-disabled:text-disabled', className)}
    />
  );
}

export function FieldsetHint({ className, ...props }: ComponentProps<'span'>) {
  return <ArkFieldset.HelperText {...props} className={clsx('text-body-sm text-muted', className)} />;
}

/** Only rendered while the fieldset is invalid. */
export function FieldsetError({ className, children, ...props }: ComponentProps<'span'>) {
  return (
    <ArkFieldset.ErrorText
      {...props}
      className={clsx('row items-start gap-2 text-body-sm text-danger', className)}
    >
      <Icon name="error" size="md" />
      {children}
    </ArkFieldset.ErrorText>
  );
}
