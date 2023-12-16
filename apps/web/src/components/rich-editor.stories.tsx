import type { Meta, StoryObj } from 'storybook-solidjs';

import { RichEditor } from './rich-editor';

const meta = {
  title: 'Components/RichEditor',
  component: RichEditor,
  args: {
    placeholder: 'Placeholder...',
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof RichEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const richEditor: Story = {};
