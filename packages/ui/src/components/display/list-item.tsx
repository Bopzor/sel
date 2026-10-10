import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon } from './icon';

import type { LinkComponent } from '../../utils';

/**
 * A list row: a leading Avatar or Icon, a ListItem.Content, then a ListItem.Chevron. A ListItem.Link or a ListItem.Button
 * in the title makes the whole row clickable.
 */
function ListItemRoot({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      {...props}
      className={clsx(
        'relative row min-h-16 items-center gap-3 px-4 py-3 not-last:border-b',
        'has-data-list-item-cover:transition hover:has-data-list-item-cover:bg-surface-hover',
        className,
      )}
    />
  );
}

/** The title (or a ListItem.Header) and the description. */
function ListItemContent({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('stack min-w-0 flex-1', className)} />;
}

/** Inside the ListItem.Content: the ListItem.Title, then a badge, an amount or a date, on the title's line. */
function ListItemHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('row items-center justify-between gap-3', className)} />;
}

/** Two lines at most. */
function ListItemTitle({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={clsx('line-clamp-2 text-body text-default', className)} />;
}

/** Two lines at most. */
function ListItemDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={clsx('line-clamp-2 text-body-sm text-muted', className)} />;
}

/** Shows that the row opens a detail. */
function ListItemChevron({ className }: { className?: string }) {
  return <Icon name="chevron-right" size="md" className={clsx('text-subtle', className)} />;
}

// The link or button of the title covers the whole row with its ::after, so that the row has a single interactive
// element, named by the title. The focus ring is drawn by the cover, inside the row, since a card clips its overflow.
const cover = clsx(
  'text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:focus-ring-inset',
);

/** Inside the ListItem.Title: the whole row becomes a link, named by the title. */
function ListItemLink({ Link = 'a', className, ...props }: ComponentProps<'a'> & { Link?: LinkComponent }) {
  return <Link {...props} data-list-item-cover="" className={clsx(cover, className)} />;
}

/** Inside the ListItem.Title: the whole row becomes a button, named by the title. */
function ListItemButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...props}
      data-list-item-cover=""
      className={clsx('cursor-pointer', cover, className)}
    />
  );
}

export {
  ListItemRoot as Root,
  ListItemContent as Content,
  ListItemHeader as Header,
  ListItemTitle as Title,
  ListItemDescription as Description,
  ListItemChevron as Chevron,
  ListItemLink as Link,
  ListItemButton as Button,
};
