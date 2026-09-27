import clsx from 'clsx';
import type { ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

export type BottomNavItem = {
  value: string;
  /** One word. */
  label: string;
  icon: IconName;
  href: string;
};

export type BottomNavProps = Omit<ComponentProps<'nav'>, 'onChange'> & {
  /** Five at most. */
  items: BottomNavItem[];
  value: string;
  onChange?: (value: string) => void;
  /** Accessible name of the navigation ("Main navigation"). */
  label: string;
  /** Fixes the bar at the bottom of the screen, above the phone's home indicator. */
  fixed?: boolean;
};

export function BottomNav({
  items,
  value,
  onChange,
  label,
  fixed = false,
  className,
  ...props
}: BottomNavProps) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={clsx(
        'border-t bg-surface pb-safe-area shadow-md',
        fixed && 'fixed inset-x-0 bottom-0 z-nav',
        className,
      )}
    >
      <ul className="flex min-h-bottom-nav">
        {items.map((item) => {
          const active = item.value === value;

          return (
            <li key={item.value} className="flex min-w-0 flex-1">
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange?.(item.value)}
                className={clsx(
                  'group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 no-underline select-none',
                  active ? 'text-primary' : 'text-muted',
                )}
              >
                <span
                  className={clsx(
                    'flex h-8 w-16 items-center justify-center rounded-full transition',
                    active
                      ? 'bg-primary-subtle group-hover:bg-primary-subtle-hover'
                      : 'group-hover:bg-surface-hover',
                  )}
                >
                  <Icon name={item.icon} />
                </span>
                <span className="max-w-full truncate text-caption">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
