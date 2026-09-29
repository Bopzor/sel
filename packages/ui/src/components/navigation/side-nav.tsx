import clsx from 'clsx';
import { useId, type ComponentProps } from 'react';

import { Icon, type IconName } from '../display/icon';

import type { Override } from '../../utils';

export type SideNavItem = {
  value: string;
  label: string;
  icon: IconName;
  href: string;
};

export type SideNavSection = {
  /** Omitted for the first section, the main entries. */
  title?: string;
  items: SideNavItem[];
};

export type SideNavProps = Override<
  ComponentProps<'nav'>,
  {
    /** The instance's name. */
    name: string;
    /** The instance's geographical area. */
    place?: string;
    /** URL of the instance's logo, a square image. */
    logo: string;
    sections: SideNavSection[];
    value: string;
    onChange?: (value: string) => void;
    /** Accessible name of the navigation ("Main navigation"). */
    label: string;
  }
>;

export function SideNav({
  name,
  place,
  logo,
  sections,
  value,
  onChange,
  label,
  className,
  ...props
}: SideNavProps) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={clsx('flex w-sidebar flex-col gap-6 border-r bg-surface px-4 py-6', className)}
    >
      <div className="flex items-center gap-3 px-3">
        {/* The name next to it says what the logo shows. */}
        <img src={logo} alt="" className="size-logo shrink-0 rounded-md" />
        <p className="flex min-w-0 flex-col">
          <span className="truncate text-body-strong text-default">{name}</span>
          {place && <span className="truncate text-body-sm text-muted">{place}</span>}
        </p>
      </div>

      {sections.map((section, index) => (
        <SideNavSectionList key={index} section={section} value={value} onChange={onChange} />
      ))}
    </nav>
  );
}

type SideNavSectionListProps = {
  section: SideNavSection;
  value: string;
  onChange?: (value: string) => void;
};

function SideNavSectionList({ section, value, onChange }: SideNavSectionListProps) {
  const titleId = useId();

  return (
    <div className="flex flex-col gap-1">
      {section.title && (
        <p id={titleId} className="px-3 text-caption text-subtle">
          {section.title}
        </p>
      )}

      <ul aria-labelledby={section.title ? titleId : undefined} className="flex flex-col gap-1">
        {section.items.map((item) => {
          const active = item.value === value;

          return (
            <li key={item.value}>
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange?.(item.value)}
                className={clsx(
                  'flex min-h-control-md items-center gap-3 rounded-md px-3 text-label no-underline transition select-none',
                  active
                    ? 'bg-primary-subtle text-primary hover:bg-primary-subtle-hover'
                    : 'text-muted hover:bg-surface-hover hover:text-default',
                )}
              >
                <Icon name={item.icon} />
                <span className="min-w-0 truncate">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
