import type { Meta, StoryObj } from 'storybook-solidjs';

import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Placeholder',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const input: Story = {};
