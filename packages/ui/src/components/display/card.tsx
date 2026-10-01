import clsx from 'clsx';
import type { ComponentProps } from 'react';

import type { LinkComponent, Override } from '../../utils';

/**
 * A rounded surface that groups content: CardHeader, CardBody and CardFooter go inside, or a list without padding. A
 * CardLink or a CardButton in the title makes the whole card clickable.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        // overflow-hidden clips a list's rows to the rounded corners.
        'relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-surface shadow-sm',
        'has-data-card-cover:transition hover:has-data-card-cover:shadow-md',
        className,
      )}
    />
  );
}

// Each part pads itself: a list placed between them, without a part, goes from edge to edge.
const section = clsx('px-5 first:pt-5 last:pb-5 md:px-6 first:md:pt-6 last:md:pb-6');

/** The title, the description under it, and an action at the top right. */
export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  // The action is placed in a second column, as wide as its content.
  return (
    <div {...props} className={clsx(section, 'grid grid-cols-1 items-start gap-x-3 gap-y-1', className)} />
  );
}

/** A heading, of the level that fits the page hierarchy. */
export function CardTitle({
  level = 3,
  className,
  ...props
}: Override<ComponentProps<'h3'>, { level?: 2 | 3 | 4 }>) {
  const Heading = `h${level}` as const;

  return <Heading {...props} className={clsx('col-start-1 text-title-3 text-default', className)} />;
}

/** Under the title: author, date. */
export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={clsx('col-start-1 text-body-sm text-muted', className)} />;
}

/** A badge or an icon button, at the top right. Written after the title and the description. */
export function CardAction({ className, ...props }: ComponentProps<'div'>) {
  // Positioned, so that it stays above the cover of a clickable card: positioned elements are stacked in the order
  // of the document, hence its place after the title.
  return <div {...props} className={clsx('relative col-start-2 row-span-2 row-start-1', className)} />;
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx(section, className)} />;
}

/** One or two buttons. */
export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  // Positioned, so that its buttons stay above the cover of a clickable card.
  return <div {...props} className={clsx(section, 'relative flex flex-wrap gap-3', className)} />;
}

// The link or button of the title covers the whole card with its ::after, so that the card has a single interactive
// element, named by the title. The focus ring is drawn by the cover, inside the card, which clips its overflow.
const cover = clsx(
  'text-left after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:focus-ring-inset',
);

/** Inside the CardTitle: the whole card becomes a link, named by the title. */
export function CardLink({
  Link = 'a',
  className,
  ...props
}: ComponentProps<'a'> & { Link?: LinkComponent }) {
  return <Link {...props} data-card-cover="" className={clsx(cover, className)} />;
}

/** Inside the CardTitle: the whole card becomes a button, named by the title. */
export function CardButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      {...props}
      data-card-cover=""
      className={clsx('cursor-pointer', cover, className)}
    />
  );
}
