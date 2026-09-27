import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Select, type SelectOption } from './select';

const options: SelectOption[] = [
  { value: 'first', label: 'First option' },
  { value: 'second', label: 'Second option' },
  { value: 'third', label: 'Third option' },
  { value: 'fourth', label: 'Fourth option' },
  { value: 'fifth', label: 'Fifth option' },
  { value: 'sixth', label: 'Sixth option' },
];

export default {
  title: 'Components/Forms/Select',
  component: Select,
  args: {
    label: 'Label',
    options,
    placeholder: 'Choose an option',
    value: null,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <Select {...args} value={value} onChange={setValue} />;
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const Selected: Story = {
  args: { value: 'second' },
};

export const WithHint: Story = {
  args: { hint: 'Hint about the choice.' },
};

export const Invalid: Story = {
  args: { error: 'Choose an option to continue.', required: true },
};

export const Disabled: Story = {
  args: { value: 'second', disabled: true },
};
