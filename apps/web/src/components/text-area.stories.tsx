import type { Meta, StoryObj } from 'storybook-solidjs';

import { TextArea } from './text-area';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {
    placeholder: 'Placeholder',
    rows: 4,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const textArea: Story = {};
