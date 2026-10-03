import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type EmptyStateRootProps = Override<
  ComponentProps<'div'>,
  {
    /** The icon of the content type. */
    icon: IconName;
  }
>;

/** An empty screen or block: an EmptyState.Title, an EmptyState.Description and an EmptyState.Action go inside. */
function EmptyStateRoot({ icon, className, children, ...props }: EmptyStateRootProps) {
  return (
    <div {...props} className={clsx('stack items-center gap-3 px-4 py-12 text-center', className)}>
      <Icon name={icon} className="text-subtle" />
      {children}
    </div>
  );
}

/** What is missing, in one sentence: a heading, of the level that fits the page hierarchy. */
function EmptyStateTitle({
  level = 2,
  className,
  ...props
}: Override<ComponentProps<'h2'>, { level?: 1 | 2 | 3 }>) {
  const Heading = `h${level}` as const;

  return <Heading {...props} className={clsx('text-title-3 text-default', className)} />;
}

/** Why, or what will happen. */
function EmptyStateDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('max-w-content text-body text-muted', className)} />;
}

/** A Button that helps get out of it. */
function EmptyStateAction({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('mt-3', className)} />;
}

export {
  EmptyStateRoot as Root,
  EmptyStateTitle as Title,
  EmptyStateDescription as Description,
  EmptyStateAction as Action,
};
