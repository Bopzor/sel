import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

export default {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  args: {
    variant: 'text',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Skeleton>;

type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex max-w-90 flex-col gap-3">
      <Skeleton />
      <Skeleton variant="circle" />
      <Skeleton variant="rect" className="h-24" />
    </div>
  ),
};

export const ListRow: Story = {
  render: () => (
    <div aria-busy className="flex max-w-90 items-center gap-3">
      <Skeleton variant="circle" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="w-1/2" />
        <Skeleton />
      </div>
    </div>
  ),
};
