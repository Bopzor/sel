import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FormField } from './form-field';
import { TextArea } from './text-area';

export default {
  title: 'Components/Forms/TextArea',
  component: TextArea,
  render: (args) => (
    <FormField label="Label">
      <TextArea {...args} />
    </FormField>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof TextArea>;

type Story = StoryObj<typeof TextArea>;

export const Playground: Story = {};

export const Invalid: Story = {
  args: { defaultValue: 'Too short', 'aria-invalid': true },
};

export const MoreRows: Story = {
  args: { rows: 8 },
};

export const Disabled: Story = {
  args: { defaultValue: 'Value', disabled: true },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <FormField label="Label" hint={`${value.length} characters`}>
        <TextArea {...args} value={value} onChange={(event) => setValue(event.target.value)} />
      </FormField>
    );
  },
};
