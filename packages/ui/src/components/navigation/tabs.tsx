import { Tabs as ArkTabs } from '@ark-ui/react/tabs';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import type { Override } from '../../utils';

export type TabsItem = {
  value: string;
  label: string;
};

export type TabsProps = Override<
  ComponentProps<'div'>,
  {
    defaultValue?: never;
    /** Two to five views. */
    items: TabsItem[];
    value: string;
    onChange: (value: string) => void;
    /** Accessible name of the tab list. */
    label: string;
    /** The view of the active tab. */
    children: ReactNode;
  }
>;

export function Tabs({ items, value, onChange, label, children, className, ...props }: TabsProps) {
  return (
    <ArkTabs.Root
      {...props}
      value={value}
      onValueChange={(details) => onChange(details.value)}
      className={clsx('flex flex-col', className)}
    >
      {/* Scrolls horizontally when the tabs do not fit, on mobile. */}
      <ArkTabs.List aria-label={label} className="flex overflow-x-auto border-b">
        {items.map((item) => (
          <ArkTabs.Trigger
            key={item.value}
            value={item.value}
            className={clsx(
              // The focus ring is drawn inside, since the scrolling list clips its overflow.
              'relative h-control-md shrink-0 cursor-pointer px-4 text-label whitespace-nowrap transition select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 focus-visible:focus-ring-inset',
              item.value === value ? 'text-primary after:bg-primary' : 'text-muted hover:text-default',
            )}
          >
            {item.label}
          </ArkTabs.Trigger>
        ))}
      </ArkTabs.List>

      {/* Only the active view is rendered, which is the only panel Ark links a tab to. */}
      <ArkTabs.Content value={value}>{children}</ArkTabs.Content>
    </ArkTabs.Root>
  );
}
