import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field } from './field';
import { Input } from './input';

export default {
  title: 'Components/Forms/Field',
  component: Field,
  args: {
    label: 'Label',
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <Field {...args}>
      <Input />
    </Field>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Field>;

type Story = StoryObj<typeof Field>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { hint: 'Hint with an example of the expected value.' },
};

export const Invalid: Story = {
  args: {
    hint: 'Hint with an example of the expected value.',
    error: 'Error message that says how to fix the value.',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
