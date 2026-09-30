import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

export type EmptyStateProps = Override<
  ComponentProps<'div'>,
  {
    /** The icon of the content type. */
    icon: IconName;
  }
>;

/** An empty screen or block: an EmptyStateTitle, an EmptyStateDescription and an EmptyStateAction go inside. */
export function EmptyState({ icon, className, children, ...props }: EmptyStateProps) {
  return (
    <div {...props} className={clsx('flex flex-col items-center gap-3 px-4 py-12 text-center', className)}>
      <Icon name={icon} className="text-subtle" />
      {children}
    </div>
  );
}

export type EmptyStateTitleProps = Override<
  ComponentProps<'h2'>,
  {
    /** To adjust to the page hierarchy. */
    level?: 2 | 3 | 4;
  }
>;

/** What is missing, in one sentence. */
export function EmptyStateTitle({ level = 2, className, ...props }: EmptyStateTitleProps) {
  const Heading = `h${level}` as const;

  return <Heading {...props} className={clsx('text-title-3 text-default', className)} />;
}

export type EmptyStateDescriptionProps = ComponentProps<'div'>;

/** Why, or what will happen. */
export function EmptyStateDescription({ className, ...props }: EmptyStateDescriptionProps) {
  return <div {...props} className={clsx('max-w-content text-body text-muted', className)} />;
}

export type EmptyStateActionProps = ComponentProps<'div'>;

/** A Button that helps get out of it. */
export function EmptyStateAction({ className, ...props }: EmptyStateActionProps) {
  return <div {...props} className={clsx('mt-3', className)} />;
}
