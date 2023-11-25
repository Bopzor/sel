import { Address } from '@sel/shared';
import { debounce } from '@solid-primitives/scheduled';
import { Component, For, Show, createEffect, createResource, createSignal } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';
import { deepTrack } from '../utils/deep-track';

import { Input } from './input';
import { Map } from './map';
import { formatAddressInline } from './member-address';
import { Spinner } from './spinner';

type AddressSearchProps = {
  placeholder?: string;
  value?: Address;
  onSelected: (address: Address) => void;
};

export const AddressSearch: Component<AddressSearchProps> = (props) => {
  const [query, setQuery] = createSignal('');
  const setQueryDebounced = debounce(setQuery, 100);

  const [results, { mutate }] = createResource(query, searchAddress);

  createEffect(() => {
    deepTrack(props.value);

    if (props.value !== undefined) {
      mutate(undefined);
    }
  });

  return (
    <div class="col gap-4">
      <Input
        name="address"
        width="full"
        placeholder={props.placeholder}
        value={props.value ? formatAddressInline(props.value) : undefined}
        onInput={(event) => setQueryDebounced(event.currentTarget.value)}
        end={results.loading && <Spinner class="h-4 w-4 text-dim" />}
      />

      <AddressList addresses={results() ?? []} onSelected={(address) => props.onSelected(address)} />

      <Map
        center={props.value?.position ?? [5.042, 43.836]}
        zoom={props.value?.position ? 14 : 11}
        class="h-map rounded-lg shadow"
        markers={props.value?.position ? [{ isPopupOpen: false, position: props.value.position }] : undefined}
      />
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
  onSelected: (address: Address) => void;
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
                onClick={() => props.onSelected(address)}
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
