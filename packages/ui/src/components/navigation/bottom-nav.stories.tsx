import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import * as BottomNav from './bottom-nav';

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
    <BottomNav.Item
      key={item.value}
      href={`#${item.value}`}
      icon={item.icon}
      active={item.value === value}
      onClick={() => setValue(item.value)}
    >
      {item.label}
    </BottomNav.Item>
  ));
}

export default {
  title: 'Components/Navigation/BottomNav',
  component: BottomNav.Root,
  args: {
    'aria-label': 'Main navigation',
    children: undefined,
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <BottomNav.Root {...args}>
      <Entries items={items} />
    </BottomNav.Root>
  ),
} satisfies Meta<typeof BottomNav.Root>;

type Story = StoryObj<typeof BottomNav.Root>;

export const Playground: Story = {};

export const ThreeEntries: Story = {
  render: (args) => (
    <BottomNav.Root {...args}>
      <Entries items={items.slice(0, 3)} />
    </BottomNav.Root>
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
      <BottomNav.Root {...args}>
        <Entries items={items} />
      </BottomNav.Root>
    </div>
  ),
};
