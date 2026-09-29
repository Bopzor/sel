import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from './checkbox';

export default {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Label',
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const WithDescription: Story = {
  args: { description: 'Description of what checking the box changes.' },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

/** checked + onChange, as with any <input type="checkbox">. */
export const Controlled: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return <Checkbox {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
  },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="First option" defaultChecked />
      <Checkbox label="Second option" description="Description of the second option." />
      <Checkbox label="Third option" />
    </div>
  ),
};
