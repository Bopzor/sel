import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Icon } from './icon';
import {
  ListItem,
  ListItemButton,
  ListItemChevron,
  ListItemContent,
  ListItemDescription,
  ListItemLink,
  ListItemTitle,
  ListItemTrailing,
} from './list-item';

export default {
  title: 'Components/Display/ListItem',
  component: ListItem,
  decorators: [(Story) => <ul className="max-w-content">{Story()}</ul>],
  render: (args) => (
    <ListItem {...args}>
      <ListItemContent>
        <ListItemTitle>Title</ListItemTitle>
        <ListItemDescription>Description</ListItemDescription>
      </ListItemContent>
    </ListItem>
  ),
} satisfies Meta<typeof ListItem>;

type Story = StoryObj<typeof ListItem>;

export const Playground: Story = {};

export const Rows: Story = {
  render: () => (
    <>
      <ListItem>
        <Avatar name="Jane Doe" decorative />
        <ListItemContent>
          <ListItemTitle>Jane Doe</ListItemTitle>
          <ListItemDescription>Description</ListItemDescription>
        </ListItemContent>
        <ListItemTrailing>Date</ListItemTrailing>
      </ListItem>

      <ListItem>
        <Icon name="notifications" className="text-muted" />
        <ListItemContent>
          <ListItemTitle>Title</ListItemTitle>
          <ListItemDescription>
            A longer description that wraps over two lines at most, and is cut beyond that, to keep the rows
            of a list at a similar height.
          </ListItemDescription>
        </ListItemContent>
        <ListItemTrailing>
          <Badge tone="success">Done</Badge>
        </ListItemTrailing>
      </ListItem>

      <ListItem>
        <Icon name="settings" className="text-muted" />
        <ListItemContent>
          <ListItemTitle>
            <ListItemLink href="#settings">Settings</ListItemLink>
          </ListItemTitle>
        </ListItemContent>
        <ListItemChevron />
      </ListItem>

      <ListItem>
        <Icon name="sign-out" className="text-muted" />
        <ListItemContent>
          <ListItemTitle>
            <ListItemButton onClick={fn()}>Action</ListItemButton>
          </ListItemTitle>
        </ListItemContent>
      </ListItem>
    </>
  ),
};
