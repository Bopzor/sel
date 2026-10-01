import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

type SideNavProps = Override<
  ComponentProps<'nav'>,
  {
    /** Accessible name of the navigation ("Main navigation"). */
    'aria-label': string;
  }
>;

/** The side navigation: a SideNavHeader, SideNavSections of SideNavItems, and a SideNavFooter. */
export function SideNav({ className, ...props }: SideNavProps) {
  return (
    <nav
      {...props}
      className={clsx('flex w-sidebar flex-col gap-6 border-r bg-surface px-4 py-6', className)}
    />
  );
}

type SideNavHeaderProps = Override<
  ComponentProps<'div'>,
  {
    /** URL of the instance's logo, a square image. */
    logo: string;
    /** The instance's name. */
    name: string;
    /** The instance's geographical area. */
    place?: string;
    children?: never;
  }
>;

/** The instance's identity, at the top. */
export function SideNavHeader({ logo, name, place, className, ...props }: SideNavHeaderProps) {
  return (
    <div {...props} className={clsx('flex items-center gap-3 px-3', className)}>
      {/* The name next to it says what the logo shows. */}
      <img src={logo} alt="" className="size-logo shrink-0 rounded-md" />
      <p className="flex min-w-0 flex-col">
        <span className="truncate text-body-strong text-default">{name}</span>
        {place && <span className="truncate text-body-sm text-muted">{place}</span>}
      </p>
    </div>
  );
}

type SideNavSectionProps = Override<
  ComponentProps<'div'>,
  {
    /** Omitted for the first section, the main entries. */
    title?: string;
    /** SideNavItems. */
    children: ReactNode;
  }
>;

export function SideNavSection({ title, className, children, ...props }: SideNavSectionProps) {
  const titleId = useId();

  return (
    <div {...props} className={clsx('flex flex-col gap-1', className)}>
      {title && (
        <p id={titleId} className="px-3 text-caption text-subtle">
          {title}
        </p>
      )}

      <ul aria-labelledby={title ? titleId : undefined} className="flex flex-col gap-1">
        {children}
      </ul>
    </div>
  );
}

type SideNavItemProps = Override<
  ComponentProps<'a'>,
  {
    href: string;
    icon: IconName;
    /** The entry of the current page, marked aria-current="page". */
    active?: boolean;
    /** A Badge after the label, such as a count. */
    badge?: ReactNode;
    /** The label. */
    children: ReactNode;
  }
>;

/** An entry, a link. */
export function SideNavItem({
  icon,
  active = false,
  badge,
  className,
  children,
  ...props
}: SideNavItemProps) {
  return (
    <li>
      <a
        {...props}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'flex min-h-control-md items-center gap-3 rounded-md px-3 text-label no-underline transition select-none',
          active
            ? 'bg-primary-subtle text-primary hover:bg-primary-subtle-hover'
            : 'text-muted hover:bg-surface-hover hover:text-default',
          className,
        )}
      >
        <Icon name={icon} />
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {badge}
      </a>
    </li>
  );
}

/** At the bottom: the member's account, signing out. SideNavItems go in a SideNavSection inside it. */
export function SideNavFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('mt-auto flex flex-col gap-1', className)} />;
}
