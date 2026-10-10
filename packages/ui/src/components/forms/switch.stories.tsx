import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from './switch';

export default {
  title: 'Components/Forms/Switch',
  component: Switch,
  args: {
    label: 'Label',
  },
} satisfies Meta<typeof Switch>;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const On: Story = {
  args: { defaultChecked: true },
};

export const WithDescription: Story = {
  args: { description: 'Description of what the setting changes.' },
};

export const LongLabel: Story = {
  args: {
    label: 'A long setting name that wraps over several lines on a narrow screen',
    description: 'Description of what the setting changes.',
  },
  decorators: [(Story) => <div className="max-w-80">{Story()}</div>],
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledOn: Story = {
  args: { disabled: true, defaultChecked: true },
};

/** checked + onChange, as with any <input type="checkbox">. */
export const Controlled: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return <Switch {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
  },
};

export const Settings: Story = {
  render: () => (
    <div className="stack max-w-content gap-6">
      <Switch label="First setting" description="Description of the first setting." defaultChecked />
      <Switch label="Second setting" description="Description of the second setting." />
      <Switch label="Third setting" />
    </div>
  ),
};
