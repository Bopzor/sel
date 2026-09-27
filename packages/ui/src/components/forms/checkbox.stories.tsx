import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from './checkbox';

export default {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Label',
    checked: false,
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(args.checked);

    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const WithDescription: Story = {
  args: { description: 'Description of what checking the box changes.' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true },
};

export const Group: Story = {
  render: function Render() {
    const [checked, setChecked] = useState<Record<string, boolean>>({ first: true });
    const bind = (key: string) => ({
      checked: checked[key] ?? false,
      onChange: (value: boolean) => setChecked({ ...checked, [key]: value }),
    });

    return (
      <div className="flex flex-col gap-4">
        <Checkbox label="First option" {...bind('first')} />
        <Checkbox label="Second option" description="Description of the second option." {...bind('second')} />
        <Checkbox label="Third option" {...bind('third')} />
      </div>
    );
  },
};

export const Invalid: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);

    return (
      <Checkbox
        label="I accept the terms"
        checked={checked}
        onChange={setChecked}
        error={checked ? undefined : 'Accept the terms to continue.'}
        required
      />
    );
  },
};
