import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from './field';
import { Select } from './select';

const options = (
  <>
    <option value="first">First option</option>
    <option value="second">Second option</option>
    <option value="third">Third option</option>
    <option value="fourth">Fourth option</option>
    <option value="fifth">Fifth option</option>
    <option value="sixth">Sixth option</option>
  </>
);

export default {
  title: 'Components/Forms/Select',
  component: Select,
  args: {
    children: options,
    placeholder: 'Choose an option',
  },
  render: (args) => (
    <Field label="Label">
      <Select {...args} />
    </Field>
  ),
  argTypes: {
    children: { control: false },
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const Selected: Story = {
  args: { defaultValue: 'second' },
};

export const Groups: Story = {
  args: {
    children: (
      <>
        <optgroup label="First group">
          <option value="first">First option</option>
          <option value="second">Second option</option>
        </optgroup>
        <optgroup label="Second group">
          <option value="third">Third option</option>
          <option value="fourth" disabled>
            Fourth option, unavailable
          </option>
        </optgroup>
      </>
    ),
  },
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
