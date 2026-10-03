import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';
import { IconButton } from '../actions/icon-button';

import { Avatar } from './avatar';
import { Badge } from './badge';
import * as Card from './card';
import * as ListItem from './list-item';

export default {
  title: 'Components/Display/Card',
  component: Card.Root,
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
  render: (args) => (
    <Card.Root {...args}>
      <Card.Header>
        <Card.Title>Card title</Card.Title>
        <Card.Description>Subtitle</Card.Description>
      </Card.Header>
      <Card.Body>
        <p className="text-body">The content of the card, a few lines of text.</p>
      </Card.Body>
    </Card.Root>
  ),
} satisfies Meta<typeof Card.Root>;

type Story = StoryObj<typeof Card.Root>;

export const Playground: Story = {};

export const WithActionAndFooter: Story = {
  render: () => (
    <Card.Root>
      <Card.Header>
        <Card.Title>Card title</Card.Title>
        <Card.Description>Author · Date</Card.Description>
        <Card.Action>
          <Badge tone="primary">Category</Badge>
        </Card.Action>
      </Card.Header>
      <Card.Body>
        <p className="text-body">The content of the card, a few lines of text.</p>
      </Card.Body>
      <Card.Footer>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card.Root>
      <Card.Body>
        <p className="text-body">A card without a title, holding a few lines of text.</p>
      </Card.Body>
    </Card.Root>
  ),
};

/** The title's link or button covers the card. The action and the footer's buttons stay clickable above it. */
export const Clickable: Story = {
  render: () => (
    <div className="stack gap-4">
      <Card.Root>
        <Card.Header>
          <Card.Title>
            <Card.Link href="#card">A card that is a link</Card.Link>
          </Card.Title>
          <Card.Description>Author · Date</Card.Description>
        </Card.Header>
        <Card.Body>
          <p className="text-body">The whole card opens the detail.</p>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title>
            <Card.Button onClick={fn()}>A card that is a button</Card.Button>
          </Card.Title>
          <Card.Description>Author · Date</Card.Description>
          <Card.Action>
            <IconButton icon="more" label="More actions" size="sm" onClick={fn()} />
          </Card.Action>
        </Card.Header>
        <Card.Body>
          <p className="text-body">The whole card triggers an action.</p>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" variant="secondary" onClick={fn()}>
            Secondary action
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  ),
};

/** A list placed without Card.Body goes from edge to edge. */
export const WithList: Story = {
  render: () => (
    <Card.Root>
      <Card.Header>
        <Card.Title>List title</Card.Title>
      </Card.Header>
      <ul className="border-t">
        {['Jane Doe', 'John Smith'].map((name) => (
          <ListItem.Root key={name}>
            <Avatar name={name} decorative />
            <ListItem.Content>
              <ListItem.Title>
                <ListItem.Link href={`#${name}`}>{name}</ListItem.Link>
              </ListItem.Title>
              <ListItem.Description>Description</ListItem.Description>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem.Root>
        ))}
      </ul>
    </Card.Root>
  ),
};
