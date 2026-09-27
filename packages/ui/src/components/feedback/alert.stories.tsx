import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';

import { Alert } from './alert';

export default {
  title: 'Components/Feedback/Alert',
  component: Alert,
  args: {
    tone: 'info',
    title: 'Title of the message',
    children: 'A sentence that explains the message and what to do next.',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof Alert>;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex max-w-content flex-col gap-3">
      <Alert tone="info" title="Info">
        A useful detail about the current screen.
      </Alert>
      <Alert tone="success" title="Success">
        A confirmation with a next step.
      </Alert>
      <Alert tone="warning" title="Warning">
        A risk to know before acting.
      </Alert>
      <Alert tone="danger" title="Danger">
        What happened, and what to do.
      </Alert>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="max-w-content">
      <Alert
        tone="danger"
        title="The action failed"
        actions={
          <Button size="sm" variant="secondary">
            Retry
          </Button>
        }
        onClose={fn()}
        closeLabel="Close"
      >
        Check the connection, then try again.
      </Alert>
    </div>
  ),
};
