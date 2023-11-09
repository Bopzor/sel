import { Address } from '@sel/shared';
import { debounce } from '@solid-primitives/scheduled';
import { Component, For, Show, createResource, createSignal } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

import { Input } from './input';
import { Spinner } from './spinner';

type AddressSearchProps = {
  onAddressSelected: (address: Address) => void;
};

export const AddressSearch: Component<AddressSearchProps> = (props) => {
  const [query, setQuery] = createSignal('');
  const setQueryDebounced = debounce(setQuery, 1000);

  const [results] = createResource(query, searchAddress);

  const handleAddressSelected = (formatted: string, address: Address) => {
    setQuery(formatted);
    props.onAddressSelected(address);
  };

  return (
    <div class="col gap-4">
      <Input
        class="border"
        width="full"
        value={query()}
        onInput={(event) => setQueryDebounced(event.currentTarget.value)}
        end={results.loading && <Spinner class="h-4 w-4 text-dim" />}
      />

      <AddressList addresses={results() ?? []} onAddressSelected={handleAddressSelected} />
    </div>
  );
};

async function searchAddress(query: string) {
  if (query.length <= 3) {
    return;
  }

  return container.resolve(TOKENS.geocode).search(query);
}

type AddressListProps = {
  addresses: Array<[formatted: string, address: Address]>;
  onAddressSelected: (formatted: string, address: Address) => void;
};

const AddressList = (props: AddressListProps) => {
  return (
    <Show when={props.addresses.length > 0}>
      <ul role="listbox" class="divide-y rounded border bg-neutral">
        <For each={props.addresses}>
          {([formatted, address]) => (
            <li role="option">
              <button
                type="button"
                class="w-full p-2 text-left hover:bg-primary/5"
                onClick={() => props.onAddressSelected(formatted, address)}
              >
                {formatted}
              </button>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
};
