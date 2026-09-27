import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from './icon';

export type ListItemProps = Omit<ComponentProps<'li'>, 'title' | 'onClick'> & {
  title: ReactNode;
  /** Two lines at most. */
  description?: ReactNode;
  /** An Avatar or an Icon. */
  leading?: ReactNode;
  /** A badge, an amount, a date. */
  trailing?: ReactNode;
  /** Shows that the row opens a detail. */
  chevron?: boolean;
  /** Makes the whole row a link, named by the title. */
  href?: string;
  /** Makes the whole row a button, named by the title. */
  onClick?: () => void;
};

export function ListItem({
  title,
  description,
  leading,
  trailing,
  chevron = false,
  href,
  onClick,
  className,
  ...props
}: ListItemProps) {
  const clickable = href !== undefined || onClick !== undefined;

  // The link or button covers the whole row with its ::after, so that the row has a single interactive
  // element. The focus ring is drawn inside the row, since a flush card clips its overflow.
  const cover = clsx('text-left after:absolute after:inset-0 focus-visible:outline-none');

  return (
    <li
      {...props}
      className={clsx(
        'relative flex min-h-16 items-center gap-3 px-4 py-3 not-last:border-b',
        clickable && 'transition hover:bg-surface-hover has-focus-visible:focus-ring-inset',
        className,
      )}
    >
      {leading}

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-body text-default">
          {href !== undefined ? (
            <a href={href} className={cover}>
              {title}
            </a>
          ) : onClick ? (
            <button type="button" onClick={onClick} className={clsx('cursor-pointer', cover)}>
              {title}
            </button>
          ) : (
            title
          )}
        </p>
        {description && <p className="line-clamp-2 text-body-sm text-muted">{description}</p>}
      </div>

      {trailing && <div className="shrink-0 text-body-sm text-muted">{trailing}</div>}
      {chevron && <Icon name="chevron-right" size="md" className="text-subtle" />}
    </li>
  );
}
