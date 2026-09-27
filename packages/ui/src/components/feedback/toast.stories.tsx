import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Toast } from './toast';

export default {
  title: 'Components/Feedback/Toast',
  component: Toast,
  args: {
    children: 'Message of the toast',
    tone: 'success',
  },
  decorators: [(Story) => <div className="max-w-96">{Story()}</div>],
} satisfies Meta<typeof Toast>;

type Story = StoryObj<typeof Toast>;

export const Playground: Story = {};

export const Info: Story = {
  args: { tone: 'info' },
};

export const Danger: Story = {
  args: { tone: 'danger' },
};

export const WithClose: Story = {
  args: { onClose: fn(), closeLabel: 'Close' },
};
