import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';
import { IconButton } from '../actions/icon-button';

import { Avatar } from './avatar';
import { Badge } from './badge';
import {
  Card,
  CardAction,
  CardBody,
  CardButton,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLink,
  CardTitle,
} from './card';
import {
  ListItem,
  ListItemChevron,
  ListItemContent,
  ListItemDescription,
  ListItemLink,
  ListItemTitle,
} from './list-item';

export default {
  title: 'Components/Display/Card',
  component: Card,
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Subtitle</CardDescription>
      </CardHeader>
      <CardBody>
        <p className="text-body">The content of the card, a few lines of text.</p>
      </CardBody>
    </Card>
  ),
} satisfies Meta<typeof Card>;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

export const WithActionAndFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Author · Date</CardDescription>
        <CardAction>
          <Badge tone="primary">Category</Badge>
        </CardAction>
      </CardHeader>
      <CardBody>
        <p className="text-body">The content of the card, a few lines of text.</p>
      </CardBody>
      <CardFooter>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </CardFooter>
    </Card>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card>
      <CardBody>
        <p className="text-body">A card without a title, holding a few lines of text.</p>
      </CardBody>
    </Card>
  ),
};

/** The title's link or button covers the card. The action and the footer's buttons stay clickable above it. */
export const Clickable: Story = {
  render: () => (
    <div className="stack gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <CardLink href="#card">A card that is a link</CardLink>
          </CardTitle>
          <CardDescription>Author · Date</CardDescription>
        </CardHeader>
        <CardBody>
          <p className="text-body">The whole card opens the detail.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardButton onClick={fn()}>A card that is a button</CardButton>
          </CardTitle>
          <CardDescription>Author · Date</CardDescription>
          <CardAction>
            <IconButton icon="more" label="More actions" size="sm" onClick={fn()} />
          </CardAction>
        </CardHeader>
        <CardBody>
          <p className="text-body">The whole card triggers an action.</p>
        </CardBody>
        <CardFooter>
          <Button size="sm" variant="secondary" onClick={fn()}>
            Secondary action
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/** A list placed without CardBody goes from edge to edge. */
export const WithList: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>List title</CardTitle>
      </CardHeader>
      <ul className="border-t">
        {['Jane Doe', 'John Smith'].map((name) => (
          <ListItem key={name}>
            <Avatar name={name} decorative />
            <ListItemContent>
              <ListItemTitle>
                <ListItemLink href={`#${name}`}>{name}</ListItemLink>
              </ListItemTitle>
              <ListItemDescription>Description</ListItemDescription>
            </ListItemContent>
            <ListItemChevron />
          </ListItem>
        ))}
      </ul>
    </Card>
  ),
};
