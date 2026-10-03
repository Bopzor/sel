import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import * as Fieldset from './fieldset';
import * as RadioGroup from './radio-group';

export default {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup.Root,
  args: {
    'aria-label': 'Question',
    defaultValue: 'first',
    children: undefined,
  },
  argTypes: {
    children: { control: false },
  },
  render: (args) => (
    <RadioGroup.Root {...args}>
      <RadioGroup.Item value="first" label="First option" />
      <RadioGroup.Item value="second" label="Second option" />
      <RadioGroup.Item value="third" label="Third option" />
    </RadioGroup.Root>
  ),
} satisfies Meta<typeof RadioGroup.Root>;

type Story = StoryObj<typeof RadioGroup.Root>;

export const Playground: Story = {};

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup.Root {...args}>
      <RadioGroup.Item value="first" label="First option" description="Description of the first option." />
      <RadioGroup.Item value="second" label="Second option" description="Description of the second option." />
      <RadioGroup.Item value="third" label="Third option" description="Description of the third option." />
    </RadioGroup.Root>
  ),
};

export const Cards: Story = {
  render: (args) => (
    <RadioGroup.Root {...args} className="gap-3">
      <RadioGroup.Card value="first" label="First option" description="Description of the first option." />
      <RadioGroup.Card value="second" label="Second option" description="Description of the second option." />
      <RadioGroup.Card value="third" label="Third option" description="Description of the third option." />
    </RadioGroup.Root>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
};

export const Invalid: Story = {
  args: { defaultValue: null, invalid: true, required: true },
};

export const InvalidCards: Story = {
  ...Cards,
  args: { ...Invalid.args },
};

/** In a form: the question and the error on a Fieldset, which names the group and passes it the invalid state. */
export const InFieldset: Story = {
  args: { 'aria-label': undefined, defaultValue: null, required: true },
  render: (args) => (
    <Fieldset.Root invalid>
      <Fieldset.Legend>Question</Fieldset.Legend>
      <RadioGroup.Root {...args}>
        <RadioGroup.Item value="first" label="First option" />
        <RadioGroup.Item value="second" label="Second option" />
        <RadioGroup.Item value="third" label="Third option" />
      </RadioGroup.Root>
      <Fieldset.Error>Error message that says what to choose.</Fieldset.Error>
    </Fieldset.Root>
  ),
};

export const DisabledOption: Story = {
  render: (args) => (
    <RadioGroup.Root {...args}>
      <RadioGroup.Item value="first" label="First option" />
      <RadioGroup.Item value="second" label="Second option" />
      <RadioGroup.Item value="third" label="Third option" disabled />
    </RadioGroup.Root>
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
      <RadioGroup.Root {...args} value={value} onChange={setValue}>
        <RadioGroup.Item value="first" label="First option" />
        <RadioGroup.Item value="second" label="Second option" />
        <RadioGroup.Item value="third" label="Third option" />
      </RadioGroup.Root>
    );
  },
};
