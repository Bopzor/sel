import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../actions/button';
import { iconNames } from '../display/icon';

import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateTitle } from './empty-state';

export default {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  args: {
    icon: 'request',
    children: (
      <>
        <EmptyStateTitle>Nothing here yet</EmptyStateTitle>
        <EmptyStateDescription>Items will appear here as soon as they are created.</EmptyStateDescription>
      </>
    ),
  },
  argTypes: {
    icon: { control: 'select', options: iconNames, table: { type: { summary: 'IconName' } } },
    children: { control: false },
  },
} satisfies Meta<typeof EmptyState>;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'search',
    children: (
      <>
        <EmptyStateTitle>No results</EmptyStateTitle>
        <EmptyStateDescription>Try other words, or broaden the search.</EmptyStateDescription>
        <EmptyStateAction>
          <Button variant="secondary">Clear the search</Button>
        </EmptyStateAction>
      </>
    ),
  },
};
