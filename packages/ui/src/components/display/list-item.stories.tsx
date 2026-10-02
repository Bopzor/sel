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
  ListItemHeader,
  ListItemLink,
  ListItemTitle,
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
          <ListItemHeader>
            <ListItemTitle>Jane Doe</ListItemTitle>
            <span className="text-body-sm text-muted">Date</span>
          </ListItemHeader>
          <ListItemDescription>Description</ListItemDescription>
        </ListItemContent>
      </ListItem>

      <ListItem>
        <Icon name="notifications" className="text-muted" />
        <ListItemContent>
          <ListItemHeader>
            <ListItemTitle>Title</ListItemTitle>
            <Badge tone="success">Done</Badge>
          </ListItemHeader>
          <ListItemDescription>
            A longer description that wraps over two lines at most, and is cut beyond that, to keep the rows
            of a list at a similar height.
          </ListItemDescription>
        </ListItemContent>
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
