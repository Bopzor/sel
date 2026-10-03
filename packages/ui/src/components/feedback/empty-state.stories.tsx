import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../actions/button';
import { iconNames } from '../display/icon';

import * as EmptyState from './empty-state';

export default {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState.Root,
  args: {
    icon: 'request',
    children: (
      <>
        <EmptyState.Title>Nothing here yet</EmptyState.Title>
        <EmptyState.Description>Items will appear here as soon as they are created.</EmptyState.Description>
      </>
    ),
  },
  argTypes: {
    icon: { control: 'select', options: iconNames, table: { type: { summary: 'IconName' } } },
    children: { control: false },
  },
} satisfies Meta<typeof EmptyState.Root>;

type Story = StoryObj<typeof EmptyState.Root>;

export const Playground: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'search',
    children: (
      <>
        <EmptyState.Title>No results</EmptyState.Title>
        <EmptyState.Description>Try other words, or broaden the search.</EmptyState.Description>
        <EmptyState.Action>
          <Button variant="secondary">Clear the search</Button>
        </EmptyState.Action>
      </>
    ),
  },
};
