import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Badge } from '../display/badge';

import { Tab, TabList, TabPanel, Tabs } from './tabs';

const views = ['First', 'Second', 'Third'];

export default {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: {
    defaultValue: 'First',
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Views">
        {views.map((view) => (
          <Tab key={view} value={view}>
            {view}
          </Tab>
        ))}
      </TabList>
      {views.map((view) => (
        <TabPanel key={view} value={view}>
          <p className="pt-4 text-body text-default">Content: {view}</p>
        </TabPanel>
      ))}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {};

/** value + onChange(value). */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('Second');

    return (
      <Tabs {...args} defaultValue={undefined} value={value} onChange={setValue}>
        <TabList aria-label="Views">
          {views.map((view) => (
            <Tab key={view} value={view}>
              {view}
            </Tab>
          ))}
        </TabList>
        <TabPanel value={value}>
          <p className="pt-4 text-body text-default">Content: {value}</p>
        </TabPanel>
      </Tabs>
    );
  },
};

export const WithBadges: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Views">
        {views.map((view, index) => (
          <Tab key={view} value={view}>
            {view}
            <Badge>{index + 2}</Badge>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  ),
};

export const FiveTabs: Story = {
  args: { defaultValue: 'First view' },
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Views">
        {['First view', 'Second view', 'Third view', 'Fourth view', 'Fifth view'].map((view) => (
          <Tab key={view} value={view}>
            {view}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  ),
};
