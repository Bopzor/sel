import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BottomNav, type BottomNavItem } from './bottom-nav';

const items: BottomNavItem[] = [
  { value: 'home', label: 'Home', icon: 'home', href: '#home' },
  { value: 'requests', label: 'Requests', icon: 'request', href: '#requests' },
  { value: 'events', label: 'Events', icon: 'event', href: '#events' },
  { value: 'members', label: 'Members', icon: 'members', href: '#members' },
  { value: 'more', label: 'More', icon: 'menu', href: '#more' },
];

export default {
  title: 'Components/Navigation/BottomNav',
  component: BottomNav,
  args: {
    items,
    value: 'home',
    label: 'Main navigation',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <BottomNav {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof BottomNav>;

type Story = StoryObj<typeof BottomNav>;

export const Playground: Story = {};

export const ThreeEntries: Story = {
  args: {
    items: items.slice(0, 3),
  },
};

export const Fixed: Story = {
  args: { fixed: true },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <div className="min-h-screen pb-bottom-nav">
        <div className="flex flex-col gap-4 p-4">
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index} className="text-body text-default">
              Content {index + 1}
            </p>
          ))}
        </div>
        <BottomNav {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
