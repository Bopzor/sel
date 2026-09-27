import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { iconNames } from '../display/icon';

import { TextField } from './text-field';

export default {
  title: 'Components/Forms/TextField',
  component: TextField,
  args: {
    label: 'Label',
    value: '',
  },
  argTypes: {
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <TextField {...args} value={value} onChange={setValue} />;
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { hint: 'Hint with an example of the expected value.' },
};

export const Invalid: Story = {
  args: {
    value: 'Wrong value',
    hint: 'Hint with an example of the expected value.',
    error: 'Error message that says how to fix the value.',
  },
};

export const WithIcon: Story = {
  args: { label: 'Search', icon: 'search', type: 'search' },
};

export const WithSuffix: Story = {
  args: { label: 'Amount', value: '20', suffix: 'units', inputMode: 'numeric' },
};

export const WithPrefix: Story = {
  args: { label: 'Price', prefix: '€', inputMode: 'decimal' },
};

export const Disabled: Story = {
  args: { value: 'Value', disabled: true },
};
