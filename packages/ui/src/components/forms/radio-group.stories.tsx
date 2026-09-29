import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Radio, RadioCard, RadioGroup } from './radio-group';

export default {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup,
  args: {
    'aria-label': 'Question',
    defaultValue: 'first',
    children: undefined,
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="first" label="First option" />
      <Radio value="second" label="Second option" />
      <Radio value="third" label="Third option" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {};

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="first" label="First option" description="Description of the first option." />
      <Radio value="second" label="Second option" description="Description of the second option." />
      <Radio value="third" label="Third option" description="Description of the third option." />
    </RadioGroup>
  ),
};

export const Cards: Story = {
  render: (args) => (
    <RadioGroup {...args} className="gap-3">
      <RadioCard value="first" label="First option" description="Description of the first option." />
      <RadioCard value="second" label="Second option" description="Description of the second option." />
      <RadioCard value="third" label="Third option" description="Description of the third option." />
    </RadioGroup>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
};

export const Invalid: Story = {
  args: { defaultValue: null, 'aria-invalid': true, required: true },
};

export const InvalidCards: Story = {
  ...Cards,
  args: { ...Invalid.args },
};

export const DisabledOption: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="first" label="First option" />
      <Radio value="second" label="Second option" />
      <Radio value="third" label="Third option" disabled />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** value + onChange(value). */
export const Controlled: Story = {
  args: { defaultValue: undefined },
  render: function Render(args) {
    const [value, setValue] = useState<string | null>(null);

    return (
      <RadioGroup {...args} value={value} onChange={setValue}>
        <Radio value="first" label="First option" />
        <Radio value="second" label="Second option" />
        <Radio value="third" label="Third option" />
      </RadioGroup>
    );
  },
};
