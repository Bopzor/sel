import { Fieldset as ArkFieldset } from '@ark-ui/react/fieldset';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from '../display/icon';

import { errorStyles, hintStyles } from './field';

import type { Override } from '../../utils';

export type FieldsetProps = Override<ComponentProps<typeof ArkFieldset.Root>, { asChild?: never }>;

/**
 * A group of controls that answer one question: a RadioGroup, several Checkboxes. Ark's Fieldset links the legend,
 * the hint and the error to the group, and passes it disabled and invalid.
 */
export function Fieldset({ className, ...props }: FieldsetProps) {
  return <ArkFieldset.Root {...props} className={clsx('flex min-w-0 flex-col gap-4', className)} />;
}

export type FieldsetHeaderProps = ComponentProps<'div'>;

/** The legend and the hint, without the gap that separates them from the controls. */
export function FieldsetHeader({ className, ...props }: FieldsetHeaderProps) {
  return <div {...props} className={clsx('flex flex-col', className)} />;
}

export type FieldsetLegendProps = Override<ComponentProps<typeof ArkFieldset.Legend>, { asChild?: never }>;

/** The question. It names the fieldset through Ark's aria-labelledby, so it may be inside a FieldsetHeader. */
export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <ArkFieldset.Legend
      {...props}
      className={clsx('text-label text-default data-disabled:text-disabled', className)}
    />
  );
}

export type FieldsetHintProps = Override<ComponentProps<typeof ArkFieldset.HelperText>, { asChild?: never }>;

export function FieldsetHint({ className, ...props }: FieldsetHintProps) {
  return <ArkFieldset.HelperText {...props} className={clsx(hintStyles, className)} />;
}

export type FieldsetErrorProps = Override<ComponentProps<typeof ArkFieldset.ErrorText>, { asChild?: never }>;

/** Only rendered while the fieldset is invalid. */
export function FieldsetError({ className, children, ...props }: FieldsetErrorProps) {
  return (
    <ArkFieldset.ErrorText {...props} className={clsx(errorStyles, className)}>
      <Icon name="error" size="md" />
      {children}
    </ArkFieldset.ErrorText>
  );
}
