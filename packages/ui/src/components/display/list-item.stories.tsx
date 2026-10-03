import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Icon } from './icon';
import * as ListItem from './list-item';

export default {
  title: 'Components/Display/ListItem',
  component: ListItem.Root,
  decorators: [(Story) => <ul className="max-w-content">{Story()}</ul>],
  render: (args) => (
    <ListItem.Root {...args}>
      <ListItem.Content>
        <ListItem.Title>Title</ListItem.Title>
        <ListItem.Description>Description</ListItem.Description>
      </ListItem.Content>
    </ListItem.Root>
  ),
} satisfies Meta<typeof ListItem.Root>;

type Story = StoryObj<typeof ListItem.Root>;

export const Playground: Story = {};

export const Rows: Story = {
  render: () => (
    <>
      <ListItem.Root>
        <Avatar name="Jane Doe" decorative />
        <ListItem.Content>
          <ListItem.Header>
            <ListItem.Title>Jane Doe</ListItem.Title>
            <span className="text-body-sm text-muted">Date</span>
          </ListItem.Header>
          <ListItem.Description>Description</ListItem.Description>
        </ListItem.Content>
      </ListItem.Root>

      <ListItem.Root>
        <Icon name="notifications" className="text-muted" />
        <ListItem.Content>
          <ListItem.Header>
            <ListItem.Title>Title</ListItem.Title>
            <Badge tone="success">Done</Badge>
          </ListItem.Header>
          <ListItem.Description>
            A longer description that wraps over two lines at most, and is cut beyond that, to keep the rows
            of a list at a similar height.
          </ListItem.Description>
        </ListItem.Content>
      </ListItem.Root>

      <ListItem.Root>
        <Icon name="settings" className="text-muted" />
        <ListItem.Content>
          <ListItem.Title>
            <ListItem.Link href="#settings">Settings</ListItem.Link>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem.Root>

      <ListItem.Root>
        <Icon name="sign-out" className="text-muted" />
        <ListItem.Content>
          <ListItem.Title>
            <ListItem.Button onClick={fn()}>Action</ListItem.Button>
          </ListItem.Title>
        </ListItem.Content>
      </ListItem.Root>
    </>
  ),
};
