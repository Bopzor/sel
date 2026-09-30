import { Tabs as ArkTabs } from '@ark-ui/react/tabs';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import type { Override } from '../../utils';

export type TabsProps = Override<
  ComponentProps<typeof ArkTabs.Root>,
  {
    asChild?: never;
    onValueChange?: never;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
  }
>;

/** Two to five views of the same content: a TabList of Tabs, then a TabPanel for each tab. */
export function Tabs({ onChange, className, ...props }: TabsProps) {
  // Only the active panel is rendered.
  return (
    <ArkTabs.Root
      {...props}
      onValueChange={(details) => onChange?.(details.value)}
      lazyMount
      unmountOnExit
      className={clsx('flex flex-col', className)}
    />
  );
}

export type TabListProps = Override<
  ComponentProps<typeof ArkTabs.List>,
  {
    asChild?: never;
    /** Accessible name of the tab list. */
    'aria-label': string;
  }
>;

export function TabList({ className, ...props }: TabListProps) {
  // Scrolls horizontally when the tabs do not fit, on mobile.
  return <ArkTabs.List {...props} className={clsx('flex overflow-x-auto border-b', className)} />;
}

export type TabProps = Override<ComponentProps<typeof ArkTabs.Trigger>, { asChild?: never }>;

/** The name of a view, with its value. It may hold a Badge, after the name. */
export function Tab({ className, ...props }: TabProps) {
  return (
    <ArkTabs.Trigger
      {...props}
      className={clsx(
        // The focus ring is drawn inside, since the scrolling list clips its overflow.
        'relative inline-flex h-control-md shrink-0 cursor-pointer items-center gap-2 px-4 text-label whitespace-nowrap transition select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 focus-visible:focus-ring-inset',
        'not-data-selected:text-muted hover:not-data-selected:text-default data-selected:text-primary data-selected:after:bg-primary',
        className,
      )}
    />
  );
}

export type TabPanelProps = Override<ComponentProps<typeof ArkTabs.Content>, { asChild?: never }>;

/** The view of a tab, with the same value. */
export function TabPanel(props: TabPanelProps) {
  return <ArkTabs.Content {...props} />;
}
