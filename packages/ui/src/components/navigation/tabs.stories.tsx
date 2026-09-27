import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Tabs, type TabsItem } from './tabs';

const items: TabsItem[] = [
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second' },
  { value: 'third', label: 'Third' },
];

export default {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: {
    items,
    value: 'first',
    label: 'Views',
    children: null,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const active = args.items.find((item) => item.value === value);

    return (
      <Tabs {...args} value={value} onChange={setValue}>
        <p className="pt-4 text-body text-default">Content: {active?.label}</p>
      </Tabs>
    );
  },
} satisfies Meta<typeof Tabs>;

type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {};

export const FiveTabs: Story = {
  args: {
    items: [
      { value: 'first', label: 'First view' },
      { value: 'second', label: 'Second view' },
      { value: 'third', label: 'Third view' },
      { value: 'fourth', label: 'Fourth view' },
      { value: 'fifth', label: 'Fifth view' },
    ],
  },
};
