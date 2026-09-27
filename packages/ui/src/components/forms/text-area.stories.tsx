import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextArea } from './text-area';

export default {
  title: 'Components/Forms/TextArea',
  component: TextArea,
  args: {
    label: 'Label',
    value: '',
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof TextArea>;

type Story = StoryObj<typeof TextArea>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: { hint: 'Hint with an example of the expected text.' },
};

export const Invalid: Story = {
  args: {
    value: 'Too short',
    hint: 'Hint with an example of the expected text.',
    error: 'Error message that says how to fix the text.',
  },
};

export const MoreRows: Story = {
  args: { rows: 8 },
};

export const Disabled: Story = {
  args: { value: 'Value', disabled: true },
};
