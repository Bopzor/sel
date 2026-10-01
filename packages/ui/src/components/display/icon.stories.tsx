import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon, iconNames } from './icon';

export default {
  title: 'Components/Display/Icon',
  component: Icon,
  args: {
    name: 'request',
    size: 'lg',
  },
  argTypes: {
    name: { control: 'select', options: iconNames, table: { type: { summary: 'IconName' } } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Icon>;

type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};

export const Concepts: Story = {
  render: () => (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {iconNames.map((name) => (
        <li key={name} className="stack items-center gap-2 text-center">
          <Icon name={name} />
          <code className="text-caption text-muted">{name}</code>
        </li>
      ))}
    </ul>
  ),
};
