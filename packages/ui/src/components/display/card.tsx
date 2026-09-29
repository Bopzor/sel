import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import type { Override } from '../../utils';

export type CardProps = Override<
  ComponentProps<'div'>,
  {
    title?: ReactNode;
    /** Author, date. */
    subtitle?: ReactNode;
    headingLevel?: 2 | 3 | 4;
    /** A badge or an icon button, at the top right. */
    action?: ReactNode;
    /** One or two buttons. */
    footer?: ReactNode;
    /** Removes the padding, to hold a list. */
    flush?: boolean;
    /** Makes the whole card a link. Needs a title, which becomes the link's text. */
    href?: string;
    /** Makes the whole card a button. Needs a title, which becomes the button's text. */
    onClick?: () => void;
  }
>;

export function Card({
  title,
  subtitle,
  headingLevel = 3,
  action,
  footer,
  flush = false,
  href,
  onClick,
  className,
  children,
  ...props
}: CardProps) {
  const Heading = `h${headingLevel}` as const;
  const clickable = href !== undefined || onClick !== undefined;

  // The link or button covers the whole card with its ::after, so that the card has a single interactive
  // element, named by the title.
  const cover = clsx('text-left after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none');

  const heading = (
    <Heading className="text-title-3 text-default">
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
    </Heading>
  );

  return (
    <div
      {...props}
      className={clsx(
        'relative flex flex-col rounded-lg border bg-surface shadow-sm',
        flush ? 'overflow-hidden' : 'gap-4 p-5 md:p-6',
        clickable && 'transition hover:shadow-md has-focus-visible:focus-ring-inset',
        className,
      )}
    >
      {(title !== undefined || action !== undefined) && (
        <div className={clsx('flex items-start justify-between gap-3', flush && 'p-5 md:p-6')}>
          <div className="flex flex-col gap-1">
            {title !== undefined && heading}
            {subtitle && <p className="text-body-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}

      {children}

      {footer && <div className={clsx('flex flex-wrap gap-3', flush && 'p-5 md:p-6')}>{footer}</div>}
    </div>
  );
}
