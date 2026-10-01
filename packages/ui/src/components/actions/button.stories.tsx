import type { Meta, StoryObj } from '@storybook/react-vite';

import { iconNames } from '../display/icon';

import { Button, LinkButton } from './button';

export default {
  title: 'Components/Actions/Button',
  component: Button,
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
    iconEnd: {
      control: 'select',
      options: [undefined, ...iconNames],
      table: { type: { summary: 'IconName' } },
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="row flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost" icon="edit">
        Ghost
      </Button>
      <Button variant="danger" icon="delete">
        Danger
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="row flex-wrap items-center gap-3">
      <Button icon="send" loading>
        Send
      </Button>
      <Button disabled>Disabled</Button>
      <Button size="sm" variant="secondary" icon="add">
        Small
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="stack gap-3">
      {[false, true].map((loading) => (
        <div key={String(loading)} className="row flex-wrap items-center gap-3">
          <Button loading={loading} icon="send">
            Start icon
          </Button>
          <Button loading={loading} iconEnd="next">
            End icon
          </Button>
          <Button loading={loading} icon="send" iconEnd="next">
            Both icons
          </Button>
          <Button loading={loading}>No icon</Button>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="row flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const MobilePrimaryAction: Story = {
  render: () => (
    <div className="max-w-90">
      <Button size="lg" iconEnd="next" className="w-full">
        Next
      </Button>
    </div>
  ),
};

export const Link: Story = {
  render: () => (
    <LinkButton href="#link" variant="secondary" iconEnd="next">
      Link
    </LinkButton>
  ),
};
