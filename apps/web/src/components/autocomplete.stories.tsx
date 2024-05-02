import { wait } from '@sel/utils';
import { createSignal } from 'solid-js';
import { Meta } from 'storybook-solidjs';

import { createAsyncCall } from '../utils/create-async-call';

import { Autocomplete } from './autocomplete';

export default {
  title: 'Components/Autocomplete',
} satisfies Meta;

type Item = {
  id: string;
  text: string;
};

const allItems: Item[] = [
  { id: '1', text: 'one' },
  { id: '2', text: 'two' },
  { id: '3', text: 'three' },
  { id: '4', text: 'four' },
];

export const autocomplete = () => {
  const [items, setItems] = createSignal<Item[]>(allItems);

  const [search, pending] = createAsyncCall(
    async (query: string) => {
      await wait(500);

      if (query === '') {
        return allItems;
      } else {
        return allItems.filter((item) => item.text.match(query));
      }
    },
    { onSuccess: setItems },
    { debounce: 1000 },
  );

  return (
    <Autocomplete
      label="Search an item"
      loading={pending()}
      items={items}
      itemToString={(item) => item?.text ?? ''}
      renderItem={(item) => item.text}
      renderNoItems={() => <span class="text-center text-dim">No items found</span>}
      // eslint-disable-next-line no-console
      onItemSelected={console.log}
      onSearch={search}
    />
  );
};
