import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';

import { showToast, Toast, Toaster } from './toast';

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

export const Error: Story = {
  args: { tone: 'error' },
};

export const WithClose: Story = {
  args: { onClose: fn(), closeLabel: 'Close' },
};

export const WithToaster: Story = {
  decorators: [],
  render: () => (
    <div className="row gap-3">
      <Button onClick={() => showToast('Request posted')}>Show a toast</Button>
      <Button variant="secondary" onClick={() => showToast('The request could not be closed', 'error')}>
        Show an error
      </Button>
      <Toaster closeLabel="Close" />
    </div>
  ),
};
