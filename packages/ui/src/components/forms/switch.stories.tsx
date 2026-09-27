import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from './switch';

export default {
  title: 'Components/Forms/Switch',
  component: Switch,
  args: {
    label: 'Label',
    checked: false,
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(args.checked);

    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
} satisfies Meta<typeof Switch>;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const On: Story = {
  args: { checked: true },
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
  args: { disabled: true, checked: true },
};

export const Settings: Story = {
  render: function Render() {
    const [checked, setChecked] = useState<Record<string, boolean>>({ first: true });
    const bind = (key: string) => ({
      checked: checked[key] ?? false,
      onChange: (value: boolean) => setChecked({ ...checked, [key]: value }),
    });

    return (
      <div className="flex max-w-content flex-col gap-6">
        <Switch label="First setting" description="Description of the first setting." {...bind('first')} />
        <Switch label="Second setting" description="Description of the second setting." {...bind('second')} />
        <Switch label="Third setting" {...bind('third')} />
      </div>
    );
  },
};
