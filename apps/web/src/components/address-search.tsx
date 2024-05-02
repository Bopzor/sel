import { Address } from '@sel/shared';
import clsx from 'clsx';
import { ComponentProps, createSignal } from 'solid-js';

import { container } from '../infrastructure/container';
import { Translate } from '../intl/translate';
import { TOKENS } from '../tokens';
import { createAsyncCall } from '../utils/create-async-call';

import { Autocomplete } from './autocomplete';
import { formatAddressInline } from './formatted-address';
import { Input } from './input';
import { Map } from './map';

const T = Translate.prefix('common.addressSearch');

type AddressSearchProps = Pick<ComponentProps<typeof Input>, 'variant' | 'width'> & {
  placeholder?: string;
  value?: Address;
  onSelected: (address: Address) => void;
  mapClass?: string;
};

export function AddressSearch(props: AddressSearchProps) {
  const [inputValue, setInputValue] = createSignal<string>(
    // eslint-disable-next-line solid/reactivity
    props.value ? formatAddressInline(props.value) : '',
  );

  const [addresses, setAddresses] = createSignal<Array<[string, Address]>>([]);

  const [search, pending] = createAsyncCall(
    (query: string) => {
      if (query.length <= 3) {
        return Promise.resolve([]);
      }

      return container.resolve(TOKENS.geocode).search(query);
    },
    { onSuccess: setAddresses },
    { debounce: 1000 },
  );

  return (
    <div class="col grow gap-4">
      <Autocomplete
        variant={props.variant}
        width={props.width}
        loading={pending()}
        items={addresses}
        itemToString={(result) => result?.[0] ?? ''}
        onItemSelected={([formatted, address]) => {
          setInputValue(formatted);
          props.onSelected(address);
        }}
        inputValue={inputValue}
        onSearch={(query) => {
          if (query !== inputValue()) {
            void search(query);
          }
        }}
        renderItem={([formatted]) => formatted}
        renderNoItems={({ inputValue }) =>
          inputValue &&
          !pending() && (
            <button type="button" class="w-full py-6 text-center text-dim">
              <T id="noResults" />
            </button>
          )
        }
      />

      <Map
        center={props.value?.position ?? [5.042, 43.836]}
        zoom={props.value?.position ? 14 : 11}
        class={clsx('grow rounded-lg shadow', props.mapClass)}
        markers={props.value?.position ? [{ isPopupOpen: false, position: props.value.position }] : undefined}
      />
    </div>
  );
}
