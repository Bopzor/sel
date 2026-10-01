import type { Meta, StoryObj } from '@storybook/react-vite';

import { iconNames } from '../display/icon';

import { IconButton } from './icon-button';

export default {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  args: {
    icon: 'more',
    label: 'More actions',
    variant: 'ghost',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    icon: { control: 'select', options: iconNames, table: { type: { summary: 'IconName' } } },
    variant: { control: 'inline-radio', options: ['ghost', 'secondary', 'primary'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>;

type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="row items-center gap-3">
      <IconButton icon="menu" label="Menu" />
      <IconButton icon="edit" label="Edit" variant="secondary" />
      <IconButton icon="add" label="Add" variant="primary" />
      <IconButton icon="delete" label="Delete" disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="row items-center gap-3">
      <IconButton icon="close" label="Close" size="sm" />
      <IconButton icon="close" label="Close" size="md" />
    </div>
  ),
};
