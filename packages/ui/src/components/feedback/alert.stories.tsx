import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';

import { Alert, AlertActions, AlertDescription, AlertTitle } from './alert';

export default {
  title: 'Components/Feedback/Alert',
  component: Alert,
  args: {
    tone: 'info',
    children: (
      <>
        <AlertTitle>Title of the message</AlertTitle>
        <AlertDescription>A sentence that explains the message and what to do next.</AlertDescription>
      </>
    ),
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    children: { control: false },
  },
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Alert>;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="info">
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>A useful detail about the current screen.</AlertDescription>
      </Alert>
      <Alert tone="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>A confirmation with a next step.</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>A risk to know before acting.</AlertDescription>
      </Alert>
      <Alert tone="danger">
        <AlertTitle>Danger</AlertTitle>
        <AlertDescription>What happened, and what to do.</AlertDescription>
      </Alert>
    </div>
  ),
};

/** A single sentence, without a title. */
export const DescriptionOnly: Story = {
  args: {
    children: <AlertDescription>A short message that needs no title.</AlertDescription>,
  },
};

export const WithActions: Story = {
  render: () => (
    <Alert tone="danger" onClose={fn()} closeLabel="Close">
      <AlertTitle>The action failed</AlertTitle>
      <AlertDescription>Check the connection, then try again.</AlertDescription>
      <AlertActions>
        <Button size="sm" variant="secondary">
          Retry
        </Button>
      </AlertActions>
    </Alert>
  ),
};
