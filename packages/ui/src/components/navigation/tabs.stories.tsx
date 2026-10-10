import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Badge } from '../display/badge';

import * as Tabs from './tabs';

const views = ['First', 'Second', 'Third'];

export default {
  title: 'Components/Navigation/Tabs',
  component: Tabs.Root,
  args: {
    defaultValue: 'First',
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Views">
        {views.map((view) => (
          <Tabs.Tab key={view} value={view}>
            {view}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {views.map((view) => (
        <Tabs.Panel key={view} value={view}>
          <p className="pt-4 text-body text-default">Content: {view}</p>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  ),
} satisfies Meta<typeof Tabs.Root>;

type Story = StoryObj<typeof Tabs.Root>;

export const Playground: Story = {};

/** value + onChange(value). */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('Second');

    return (
      <Tabs.Root {...args} defaultValue={undefined} value={value} onChange={setValue}>
        <Tabs.List aria-label="Views">
          {views.map((view) => (
            <Tabs.Tab key={view} value={view}>
              {view}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Tabs.Panel value={value}>
          <p className="pt-4 text-body text-default">Content: {value}</p>
        </Tabs.Panel>
      </Tabs.Root>
    );
  },
};

export const WithBadges: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Views">
        {views.map((view, index) => (
          <Tabs.Tab key={view} value={view}>
            {view}
            <Badge>{index + 2}</Badge>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  ),
};

export const Links: Story = {
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Views">
        {views.map((view) => (
          <Tabs.Tab key={view} value={view} href={`#${view.toLowerCase()}`}>
            {view}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  ),
};

export const FiveTabs: Story = {
  args: { defaultValue: 'First view' },
  render: (args) => (
    <Tabs.Root {...args}>
      <Tabs.List aria-label="Views">
        {['First view', 'Second view', 'Third view', 'Fourth view', 'Fifth view'].map((view) => (
          <Tabs.Tab key={view} value={view}>
            {view}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  ),
};
