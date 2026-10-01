import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BottomNav, BottomNavItem } from './bottom-nav';

import type { IconName } from '../display/icon';

type Entry = { value: string; label: string; icon: IconName };

const items: Entry[] = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'requests', label: 'Requests', icon: 'request' },
  { value: 'events', label: 'Events', icon: 'event' },
  { value: 'more', label: 'More', icon: 'menu' },
];

function Entries({ items }: { items: Entry[] }) {
  const [value, setValue] = useState('home');

  return items.map((item) => (
    <BottomNavItem
      key={item.value}
      href={`#${item.value}`}
      icon={item.icon}
      active={item.value === value}
      onClick={() => setValue(item.value)}
    >
      {item.label}
    </BottomNavItem>
  ));
}

export default {
  title: 'Components/Navigation/BottomNav',
  component: BottomNav,
  args: {
    'aria-label': 'Main navigation',
    children: undefined,
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <BottomNav {...args}>
      <Entries items={items} />
    </BottomNav>
  ),
} satisfies Meta<typeof BottomNav>;

type Story = StoryObj<typeof BottomNav>;

export const Playground: Story = {};

export const ThreeEntries: Story = {
  render: (args) => (
    <BottomNav {...args}>
      <Entries items={items.slice(0, 3)} />
    </BottomNav>
  ),
};

export const Fixed: Story = {
  args: { fixed: true },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="min-h-screen pb-bottom-nav">
      <div className="stack gap-4 p-4">
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index} className="text-body text-default">
            Content {index + 1}
          </p>
        ))}
      </div>
      <BottomNav {...args}>
        <Entries items={items} />
      </BottomNav>
    </div>
  ),
};
