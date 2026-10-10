import { Tabs as ArkTabs } from '@ark-ui/react/tabs';
import type { Override } from '@sel/utils';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import type { LinkComponent } from '../../utils';

type TabsRootProps = Override<
  ComponentProps<'div'>,
  {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
  }
>;

/** Two to five views of the same content: a Tabs.List of Tabs.Tab, then a Tabs.Panel for each tab. */
function TabsRoot({ onChange, className, ...props }: TabsRootProps) {
  // Only the active panel is rendered.
  return (
    <ArkTabs.Root
      {...props}
      onValueChange={(details) => onChange?.(details.value)}
      navigate={null}
      lazyMount
      unmountOnExit
      className={clsx('stack', className)}
    />
  );
}

type TabListProps = Override<
  ComponentProps<'div'>,
  {
    /** Accessible name of the tab list. */
    'aria-label': string;
  }
>;

function TabsList({ className, ...props }: TabListProps) {
  // Scrolls horizontally when the tabs do not fit, on mobile.
  return <ArkTabs.List {...props} className={clsx('row overflow-x-auto border-b', className)} />;
}

type TabsTabProps = Override<
  ComponentProps<'button'>,
  {
    value: string;
    /** With an href, the tab is a link: the navigation selects it, through the Root's value. */
    href?: string;
    Link?: LinkComponent;
  }
>;

/** The name of a view, with its value. It may hold a Badge, after the name. */
function TabsTab({ href, Link = 'a', className, children, ...props }: TabsTabProps) {
  const tabClassName = clsx(
    // The focus ring is drawn inside, since the scrolling list clips its overflow.
    'relative inline-flex h-control-md shrink-0 cursor-pointer items-center gap-2 px-4 text-label whitespace-nowrap transition select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 focus-visible:focus-ring-inset',
    'not-data-selected:text-muted hover:not-data-selected:text-default data-selected:text-primary data-selected:after:bg-primary',
    className,
  );

  if (href !== undefined) {
    return (
      <ArkTabs.Trigger {...props} asChild className={tabClassName}>
        <Link href={href}>{children}</Link>
      </ArkTabs.Trigger>
    );
  }

  return (
    <ArkTabs.Trigger {...props} className={tabClassName}>
      {children}
    </ArkTabs.Trigger>
  );
}

/** The view of a tab, with the same value. */
function TabPanel(props: Override<ComponentProps<'div'>, { value: string }>) {
  return <ArkTabs.Content {...props} />;
}

export { TabsList as List, TabPanel as Panel, TabsRoot as Root, TabsTab as Tab };
