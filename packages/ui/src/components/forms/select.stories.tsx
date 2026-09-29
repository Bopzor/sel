import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from './field';
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
    options,
    placeholder: 'Choose an option',
  },
  render: (args) => (
    <Field label="Label">
      <Select {...args} />
    </Field>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const Selected: Story = {
  args: { defaultValue: 'second' },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true },
};

export const Disabled: Story = {
  args: { defaultValue: 'second', disabled: true },
};

/** value + onChange, as with any <select>. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <Field label="Label" hint={value === '' ? 'Nothing chosen' : `Chosen: ${value}`}>
        <Select {...args} value={value} onChange={(event) => setValue(event.target.value)} />
      </Field>
    );
  },
};
