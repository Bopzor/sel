import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../actions/button';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Card } from './card';
import { ListItem } from './list-item';

export default {
  title: 'Components/Display/Card',
  component: Card,
  args: {
    title: 'Card title',
    subtitle: 'Subtitle',
    children: <p className="text-body">The content of the card, a few lines of text.</p>,
  },
} satisfies Meta<typeof Card>;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
};

export const WithActionAndFooter: Story = {
  render: () => (
    <Card
      className="max-w-content"
      title="Card title"
      subtitle="Author · Date"
      action={<Badge tone="primary">Category</Badge>}
      footer={
        <>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </>
      }
    >
      <p className="text-body">The content of the card, a few lines of text.</p>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="flex max-w-content flex-col gap-4">
      <Card title="A card that is a link" subtitle="Author · Date" href="#card">
        <p className="text-body">The whole card opens the detail.</p>
      </Card>
      <Card title="A card that is a button" subtitle="Author · Date" onClick={fn()}>
        <p className="text-body">The whole card triggers an action.</p>
      </Card>
    </div>
  ),
};

export const FlushWithList: Story = {
  render: () => (
    <Card className="max-w-content" title="List title" flush>
      <ul className="border-t">
        <ListItem
          title="Jane Doe"
          description="Description"
          leading={<Avatar name="Jane Doe" decorative />}
          chevron
          href="#1"
        />
        <ListItem
          title="John Smith"
          description="Description"
          leading={<Avatar name="John Smith" decorative />}
          chevron
          href="#2"
        />
      </ul>
    </Card>
  ),
};
