import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../actions/button';
import { iconNames } from '../display/icon';

import { EmptyState } from './empty-state';

export default {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  args: {
    icon: 'request',
    title: 'Nothing here yet',
    children: 'Items will appear here as soon as they are created.',
  },
  argTypes: {
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
  },
} satisfies Meta<typeof EmptyState>;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'search',
    title: 'No results',
    children: 'Try other words, or broaden the search.',
    action: <Button variant="secondary">Clear the search</Button>,
  },
};
