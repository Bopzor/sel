import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

export type BottomNavProps = Override<
  ComponentProps<'nav'>,
  {
    /** Accessible name of the navigation ("Main navigation"). */
    'aria-label': string;
    /** Fixes the bar at the bottom of the screen, above the phone's home indicator. */
    fixed?: boolean;
    /** Five BottomNavItems at most. */
    children: ReactNode;
  }
>;

export function BottomNav({ fixed = false, className, children, ...props }: BottomNavProps) {
  return (
    <nav
      {...props}
      className={clsx(
        'border-t bg-surface pb-safe-area shadow-md',
        fixed && 'fixed inset-x-0 bottom-0 z-nav',
        className,
      )}
    >
      <ul className="flex min-h-bottom-nav">{children}</ul>
    </nav>
  );
}

export type BottomNavItemProps = Override<
  ComponentProps<'a'>,
  {
    href: string;
    icon: IconName;
    /** The entry of the current page, marked aria-current="page". */
    active?: boolean;
    /** The label, one word. */
    children: ReactNode;
  }
>;

/** An entry, a link. */
export function BottomNavItem({ icon, active = false, className, children, ...props }: BottomNavItemProps) {
  return (
    <li className="flex min-w-0 flex-1">
      <a
        {...props}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 no-underline select-none',
          active ? 'text-primary' : 'text-muted',
          className,
        )}
      >
        <span
          className={clsx(
            'flex h-8 w-16 items-center justify-center rounded-full transition',
            active ? 'bg-primary-subtle group-hover:bg-primary-subtle-hover' : 'group-hover:bg-surface-hover',
          )}
        >
          <Icon name={icon} />
        </span>
        <span className="max-w-full truncate text-caption">{children}</span>
      </a>
    </li>
  );
}
