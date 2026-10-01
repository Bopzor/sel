import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';
import { iconNames } from './icon';

export default {
  title: 'Components/Display/Badge',
  component: Badge,
  args: {
    children: 'Badge',
    tone: 'neutral',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'primary', 'info', 'success', 'warning', 'danger', 'accent'],
    },
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
  },
} satisfies Meta<typeof Badge>;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="row flex-wrap items-center gap-2">
      <Badge>Neutral</Badge>
      <Badge tone="primary">Primary</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="accent">Accent</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="row flex-wrap items-center gap-2">
      <Badge tone="primary" icon="request">
        Category
      </Badge>
      <Badge tone="info" icon="event">
        Category
      </Badge>
    </div>
  ),
};
