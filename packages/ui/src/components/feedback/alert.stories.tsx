import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';

import * as Alert from './alert';

export default {
  title: 'Components/Feedback/Alert',
  component: Alert.Root,
  args: {
    tone: 'info',
    children: (
      <>
        <Alert.Title>Title of the message</Alert.Title>
        <Alert.Description>A sentence that explains the message and what to do next.</Alert.Description>
      </>
    ),
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    children: { control: false },
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Alert.Root>;

type Story = StoryObj<typeof Alert.Root>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="stack gap-3">
      <Alert.Root tone="info">
        <Alert.Title>Info</Alert.Title>
        <Alert.Description>A useful detail about the current screen.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="success">
        <Alert.Title>Success</Alert.Title>
        <Alert.Description>A confirmation with a next step.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="warning">
        <Alert.Title>Warning</Alert.Title>
        <Alert.Description>A risk to know before acting.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="danger">
        <Alert.Title>Danger</Alert.Title>
        <Alert.Description>What happened, and what to do.</Alert.Description>
      </Alert.Root>
    </div>
  ),
};

/** A single sentence, without a title. */
export const DescriptionOnly: Story = {
  args: {
    children: <Alert.Description>A short message that needs no title.</Alert.Description>,
  },
};

export const WithActions: Story = {
  render: () => (
    <Alert.Root tone="danger" onClose={fn()} closeLabel="Close">
      <Alert.Title>The action failed</Alert.Title>
      <Alert.Description>Check the connection, then try again.</Alert.Description>
      <Alert.Actions>
        <Button size="sm" variant="secondary">
          Retry
        </Button>
      </Alert.Actions>
    </Alert.Root>
  ),
};
