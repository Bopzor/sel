import clsx from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { LinkComponent, Override } from '../../utils';

type SideNavRootProps = Override<
  ComponentProps<'nav'>,
  {
    /** Accessible name of the navigation ("Main navigation"). */
    'aria-label': string;
  }
>;

/** The side navigation: a SideNav.Header, SideNav.Sections of SideNav.Items, and a SideNav.Footer. */
function SideNavRoot({ className, ...props }: SideNavRootProps) {
  return (
    <nav {...props} className={clsx('stack w-sidebar gap-6 border-r bg-surface px-4 py-6', className)} />
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
function SideNavHeader({ logo, name, place, className, ...props }: SideNavHeaderProps) {
  return (
    <div {...props} className={clsx('row items-center gap-2.5', className)}>
      {/* The name next to it says what the logo shows. */}
      <img src={logo} alt="" className="size-logo shrink-0 rounded-md" />
      <p className="stack min-w-0">
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
    /** SideNav.Items. */
    children: ReactNode;
  }
>;

function SideNavSection({ title, className, children, ...props }: SideNavSectionProps) {
  const titleId = useId();

  return (
    <div {...props} className={clsx('stack gap-1', className)}>
      {title && (
        <p id={titleId} className="px-3 text-caption text-subtle">
          {title}
        </p>
      )}

      <ul aria-labelledby={title ? titleId : undefined} className="stack gap-1">
        {children}
      </ul>
    </div>
  );
}

type SideNavItemProps = {
  icon: IconName;
  /** The entry of the current page, marked aria-current="page". */
  active?: boolean;
  /** A Badge after the label, such as a count. */
  badge?: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  /** The label. */
  children: ReactNode;
} & ({ Link?: LinkComponent; href: string } | { Link?: never; href?: never });

/** An entry: a link with an href, a button without (signing out). */
function SideNavItem({ Link, icon, active = false, badge, className, children, ...props }: SideNavItemProps) {
  const Component = props.href ? (Link ?? 'a') : 'button';

  return (
    <li>
      <Component
        {...props}
        aria-current={active ? 'page' : undefined}
        className={clsx(
          'row min-h-control-md w-full cursor-pointer items-center gap-3 rounded-md px-3 text-start text-label no-underline transition select-none',
          active
            ? 'bg-primary-subtle text-primary hover:bg-primary-subtle-hover'
            : 'text-muted hover:bg-surface-hover hover:text-default',
          className,
        )}
      >
        <Icon name={icon} />
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {badge}
      </Component>
    </li>
  );
}

/** At the bottom: the member's account, signing out. SideNav.Items go in a SideNav.Section inside it. */
function SideNavFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={clsx('mt-auto stack gap-1', className)} />;
}

export {
  SideNavRoot as Root,
  SideNavHeader as Header,
  SideNavSection as Section,
  SideNavItem as Item,
  SideNavFooter as Footer,
};
