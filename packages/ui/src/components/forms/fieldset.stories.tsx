import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './checkbox';
import * as Fieldset from './fieldset';
import * as RadioGroup from './radio-group';

export default {
  title: 'Components/Forms/Fieldset',
  component: Fieldset.Root,
  args: {
    invalid: false,
    disabled: false,
  },
  render: (args) => (
    <Fieldset.Root {...args}>
      <Fieldset.Header>
        <Fieldset.Legend>Question</Fieldset.Legend>
        <Fieldset.Hint>Hint that helps to answer.</Fieldset.Hint>
      </Fieldset.Header>

      <RadioGroup.Root name="question">
        <RadioGroup.Item value="first" label="First option" />
        <RadioGroup.Item value="second" label="Second option" />
        <RadioGroup.Item value="third" label="Third option" />
      </RadioGroup.Root>

      <Fieldset.Error>Error message that says what to choose.</Fieldset.Error>
    </Fieldset.Root>
  ),
} satisfies Meta<typeof Fieldset.Root>;

type Story = StoryObj<typeof Fieldset.Root>;

export const Playground: Story = {};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Checkboxes: Story = {
  args: { invalid: true },
  render: (args) => (
    <Fieldset.Root {...args}>
      <Fieldset.Legend>Terms</Fieldset.Legend>
      <Checkbox label="I accept the terms" required invalid={args.invalid} />
      <Fieldset.Error>Accept the terms to continue.</Fieldset.Error>
    </Fieldset.Root>
  ),
};
