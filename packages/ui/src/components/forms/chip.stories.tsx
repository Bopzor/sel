import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { iconNames } from '../display/icon';

import { Chip } from './chip';

export default {
  title: 'Components/Forms/Chip',
  component: Chip,
  args: {
    children: 'Chip',
  },
  argTypes: {
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
  },
} satisfies Meta<typeof Chip>;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const Filters: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Record<string, boolean>>({ first: true });
    const bind = (key: string) => ({
      selected: selected[key] ?? false,
      onChange: (value: boolean) => setSelected({ ...selected, [key]: value }),
    });

    return (
      <div className="flex flex-wrap gap-2">
        <Chip {...bind('first')}>First</Chip>
        <Chip {...bind('second')}>Second</Chip>
        <Chip {...bind('third')}>Third</Chip>
        <Chip icon="filter" {...bind('more')}>
          More filters
        </Chip>
      </div>
    );
  },
};
