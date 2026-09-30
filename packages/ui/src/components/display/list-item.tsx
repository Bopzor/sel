import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from './icon';

export type ListItemProps = ComponentProps<'li'>;

/**
 * A list row: a leading Avatar or Icon, a ListItemContent, then a ListItemTrailing or a ListItemChevron. A
 * ListItemLink or a ListItemButton in the title makes the whole row clickable.
 */
export function ListItem({ className, ...props }: ListItemProps) {
  return (
    <li
      {...props}
      className={clsx(
        'relative flex min-h-16 items-center gap-3 px-4 py-3 not-last:border-b',
        'has-data-list-item-cover:transition hover:has-data-list-item-cover:bg-surface-hover',
        className,
      )}
    />
  );
}

export type ListItemContentProps = ComponentProps<'div'>;

/** The title and the description. */
export function ListItemContent({ className, ...props }: ListItemContentProps) {
  return <div {...props} className={clsx('flex min-w-0 flex-1 flex-col', className)} />;
}

export type ListItemTitleProps = ComponentProps<'p'>;

export function ListItemTitle({ className, ...props }: ListItemTitleProps) {
  return <p {...props} className={clsx('text-body text-default', className)} />;
}

export type ListItemDescriptionProps = ComponentProps<'p'>;

/** Two lines at most. */
export function ListItemDescription({ className, ...props }: ListItemDescriptionProps) {
  return <p {...props} className={clsx('line-clamp-2 text-body-sm text-muted', className)} />;
}

export type ListItemTrailingProps = ComponentProps<'div'>;

/** A badge, an amount, a date. */
export function ListItemTrailing({ className, ...props }: ListItemTrailingProps) {
  // Positioned, so that it stays above the cover of a clickable row.
  return <div {...props} className={clsx('relative shrink-0 text-body-sm text-muted', className)} />;
}

export type ListItemChevronProps = { className?: string };

/** Shows that the row opens a detail. */
export function ListItemChevron({ className }: ListItemChevronProps) {
  return <Icon name="chevron-right" size="md" className={clsx('text-subtle', className)} />;
}

// The link or button of the title covers the whole row with its ::after, so that the row has a single interactive
// element, named by the title. The focus ring is drawn by the cover, inside the row, since a card clips its overflow.
const cover = clsx(
  'text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:focus-ring-inset',
);

export type ListItemLinkProps = ComponentProps<'a'>;

/** Inside the ListItemTitle: the whole row becomes a link, named by the title. */
export function ListItemLink({ className, ...props }: ListItemLinkProps) {
  return <a {...props} data-list-item-cover="" className={clsx(cover, className)} />;
}

export type ListItemButtonProps = ComponentProps<'button'>;

/** Inside the ListItemTitle: the whole row becomes a button, named by the title. */
export function ListItemButton({ className, ...props }: ListItemButtonProps) {
  return (
    <button
      type="button"
      {...props}
      data-list-item-cover=""
      className={clsx('cursor-pointer', cover, className)}
    />
  );
}
