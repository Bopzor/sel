import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { iconNames } from '../display/icon';

import { FormField } from './form-field';
import { Input } from './input';

export default {
  title: 'Components/Forms/Input',
  component: Input,
  argTypes: {
    icon: { control: 'select', options: [undefined, ...iconNames], table: { type: { summary: 'IconName' } } },
  },
  render: (args) => (
    <FormField label="Label">
      <Input {...args} />
    </FormField>
  ),
  decorators: [(Story) => <div className="max-w-content">{Story()}</div>],
} satisfies Meta<typeof Input>;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const WithIcon: Story = {
  args: { icon: 'search', type: 'search' },
};

export const WithSuffix: Story = {
  args: { defaultValue: '20', suffix: 'units', inputMode: 'numeric' },
};

export const WithPrefix: Story = {
  args: { prefix: '€', inputMode: 'decimal' },
};

export const Disabled: Story = {
  args: { defaultValue: 'Value', disabled: true },
};

/** value + onChange, as with any <input>. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');

    return (
      <FormField label="Label" hint={`${value.length} characters`}>
        <Input {...args} value={value} onChange={(event) => setValue(event.target.value)} />
      </FormField>
    );
  },
};

/** Outside a Field, where the context already says what to type: a search in a toolbar. */
export const WithoutField: Story = {
  args: { icon: 'search', type: 'search', 'aria-label': 'Search a member', placeholder: 'Search a member' },
  render: (args) => <Input {...args} />,
};
