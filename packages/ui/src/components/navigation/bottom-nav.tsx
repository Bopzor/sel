import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { LinkComponent, Override } from '../../utils';

type BottomNavRootProps = Override<
  ComponentProps<'nav'>,
  {
    /** Accessible name of the navigation ("Main navigation"). */
    'aria-label': string;
    /** Fixes the bar at the bottom of the screen, above the phone's home indicator. */
    fixed?: boolean;
    /** Four BottomNav.Items at most. */
    children: ReactNode;
  }
>;

function BottomNavRoot({ fixed = false, className, children, ...props }: BottomNavRootProps) {
  return (
    <nav
      {...props}
      className={clsx(
        'border-t bg-surface pb-safe-area shadow-md',
        fixed && 'fixed inset-x-0 bottom-0 z-nav',
        className,
      )}
    >
      <ul className="row min-h-bottom-nav">{children}</ul>
    </nav>
  );
}

type BottomNavItemProps = Override<
  ComponentProps<'a'>,
  {
    Link?: LinkComponent;
    href: string;
    icon: IconName;
    /** The entry of the current page, marked aria-current="page". */
    active?: boolean;
    /** The label, one word. */
    children: ReactNode;
  }
>;

/** An entry, a link. */
function BottomNavItem({
  Link = 'a',
  icon,
  active = false,
  className,
  children,
  ...props
}: BottomNavItemProps) {
  return (
    <li className="row min-w-0 flex-1">
      <Link
        {...props}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'group stack min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1 py-2 no-underline select-none',
          active ? 'text-primary' : 'text-muted',
          className,
        )}
      >
        <span
          className={clsx(
            'row h-8 w-16 items-center justify-center rounded-full transition',
            active ? 'bg-primary-subtle group-hover:bg-primary-subtle-hover' : 'group-hover:bg-surface-hover',
          )}
        >
          <Icon name={icon} />
        </span>
        <span className="max-w-full truncate text-caption">{children}</span>
      </Link>
    </li>
  );
}

export { BottomNavRoot as Root, BottomNavItem as Item };
