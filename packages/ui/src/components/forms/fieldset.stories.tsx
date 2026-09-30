import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './checkbox';
import { Fieldset, FieldsetError, FieldsetHeader, FieldsetHint, FieldsetLegend } from './fieldset';
import { Radio, RadioGroup } from './radio-group';

export default {
  title: 'Components/Forms/Fieldset',
  component: Fieldset,
  args: {
    invalid: false,
    disabled: false,
  },
  render: (args) => (
    <Fieldset {...args}>
      <FieldsetHeader>
        <FieldsetLegend>Question</FieldsetLegend>
        <FieldsetHint>Hint that helps to answer.</FieldsetHint>
      </FieldsetHeader>

      <RadioGroup name="question">
        <Radio value="first" label="First option" />
        <Radio value="second" label="Second option" />
        <Radio value="third" label="Third option" />
      </RadioGroup>

      <FieldsetError>Error message that says what to choose.</FieldsetError>
    </Fieldset>
  ),
} satisfies Meta<typeof Fieldset>;

type Story = StoryObj<typeof Fieldset>;

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
    <Fieldset {...args}>
      <FieldsetLegend>Terms</FieldsetLegend>
      <Checkbox label="I accept the terms" required aria-invalid={args.invalid} />
      <FieldsetError>Accept the terms to continue.</FieldsetError>
    </Fieldset>
  ),
};
