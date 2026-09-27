import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Icon } from './icon';
import { ListItem } from './list-item';

export default {
  title: 'Components/Display/ListItem',
  component: ListItem,
  args: {
    title: 'Title',
    description: 'Description',
    chevron: false,
  },
  decorators: [(Story) => <ul className="max-w-content">{Story()}</ul>],
} satisfies Meta<typeof ListItem>;

type Story = StoryObj<typeof ListItem>;

export const Playground: Story = {};

export const Rows: Story = {
  render: () => (
    <>
      <ListItem
        title="Jane Doe"
        description="Description"
        leading={<Avatar name="Jane Doe" decorative />}
        trailing="Date"
      />
      <ListItem
        title="Title"
        description="A longer description that wraps over two lines at most, and is cut beyond that, to keep the rows of a list at a similar height."
        leading={<Icon name="notifications" className="text-muted" />}
        trailing={<Badge tone="success">Done</Badge>}
      />
      <ListItem
        title="Settings"
        leading={<Icon name="settings" className="text-muted" />}
        chevron
        href="#settings"
      />
      <ListItem title="Action" leading={<Icon name="sign-out" className="text-muted" />} onClick={fn()} />
    </>
  ),
};
