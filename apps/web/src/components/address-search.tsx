import { Address } from '@sel/shared';
import { Component, ComponentProps, For, Show, Suspense, createEffect, createResource } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';
import { createDebouncedSignal } from '../utils/debounce';
import { deepTrack } from '../utils/deep-track';

import { Input } from './input';
import { Map } from './map';
import { formatAddressInline } from './member-address';
import { Spinner } from './spinner';

type AddressSearchProps = Pick<ComponentProps<typeof Input>, 'variant' | 'width'> & {
  placeholder?: string;
  value?: Address;
  onSelected: (address: Address) => void;
};

export const AddressSearch: Component<AddressSearchProps> = (props) => {
  const [query, setQuery] = createDebouncedSignal('', 1000);

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
        variant={props.variant}
        width={props.width}
        placeholder={props.placeholder}
        value={props.value ? formatAddressInline(props.value) : undefined}
        onInput={(event) => setQuery(event.currentTarget.value)}
        end={results.loading && <Spinner class="h-4 w-4 text-dim" />}
      />

      <AddressList addresses={results() ?? []} onSelected={(address) => props.onSelected(address)} />

      <div class="h-[24rem]">
        <Map
          center={props.value?.position ?? [5.042, 43.836]}
          zoom={props.value?.position ? 14 : 11}
          class="rounded-lg shadow"
          markers={
            props.value?.position ? [{ isPopupOpen: false, position: props.value.position }] : undefined
          }
        />
      </div>
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
