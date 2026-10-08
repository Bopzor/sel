import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from './avatar';
import { Icon } from './icon';

const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#a7eed6"/><circle cx="40" cy="32" r="14" fill="#006852"/><circle cx="40" cy="80" r="28" fill="#006852"/></svg>',
  );

export default {
  title: 'Components/Display/Avatar',
  component: Avatar,
  args: {
    name: 'Jane Doe',
    size: 'md',
    decorative: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'full'] },
  },
} satisfies Meta<typeof Avatar>;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="row items-center gap-3">
      <Avatar name="Jane Doe" size="sm" />
      <Avatar name="Jane Doe" size="md" />
      <Avatar name="Jane Doe" size="lg" />
    </div>
  ),
};

export const Photo: Story = {
  render: () => <Avatar name="Jane Doe" src={photo} />,
};

export const FullSize: Story = {
  render: () => (
    <div className="row gap-4">
      <div className="w-40">
        <Avatar name="Jane Doe" src={photo} size="full" className="border shadow-sm" />
      </div>
      <div className="w-40">
        <Avatar
          name="Jane Doe"
          size="full"
          neutral
          placeholder={<Icon name="profile" className="size-1/3! opacity-40" />}
          className="border shadow-sm"
        />
      </div>
    </div>
  ),
};

export const NextToAName: Story = {
  render: () => (
    <p className="row items-center gap-2 text-body-strong">
      <Avatar name="Jane Doe" size="sm" decorative />
      Jane Doe
    </p>
  ),
};
