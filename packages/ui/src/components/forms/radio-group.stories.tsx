import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { RadioGroup, type RadioOption } from './radio-group';

const options: RadioOption[] = [
  { value: 'first', label: 'First option' },
  { value: 'second', label: 'Second option' },
  { value: 'third', label: 'Third option' },
];

const optionsWithDescription: RadioOption[] = [
  { value: 'first', label: 'First option', description: 'Description of the first option.' },
  { value: 'second', label: 'Second option', description: 'Description of the second option.' },
  { value: 'third', label: 'Third option', description: 'Description of the third option.' },
];

export default {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Question',
    options,
    value: 'first',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <RadioGroup {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof RadioGroup>;

type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { hint: 'Hint about the question.' },
};

export const WithDescriptions: Story = {
  args: { options: optionsWithDescription },
};

export const Cards: Story = {
  args: { options: optionsWithDescription, variant: 'cards' },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
};

export const Invalid: Story = {
  args: { value: null, error: 'Choose an option to continue.', required: true },
};

export const InvalidCards: Story = {
  args: { ...Invalid.args, options: optionsWithDescription, variant: 'cards' },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
};

export const DisabledOption: Story = {
  args: {
    options: [...options.slice(0, 2), { value: 'third', label: 'Third option', disabled: true }],
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
