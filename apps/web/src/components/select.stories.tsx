import { ComponentProps, createSignal } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

import { Select } from './select';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    width: 'medium',
    placeholder: 'Placeholder',
    items: ['apple', 'banana', 'pear', 'pineapple', 'kiwi'],
    renderItem: (item: string) => item,
    itemToString: (item: string) => item ?? '',
  },
} satisfies Meta<typeof Select<string>>;

export default meta;

export const select = (args: ComponentProps<typeof Select<string>>) => {
  const [value, setValue] = createSignal<string | null>(null);

  return <Select {...args} selectedItem={value} onItemSelected={setValue} />;
};
