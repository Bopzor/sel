import { useListCollection } from '@ark-ui/solid';
import { Address } from '@sel/shared';
import { assert, createId, isDefined, wait } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import { createEffect, createRenderEffect, createSignal, JSX, untrack } from 'solid-js';

import { getAppConfig } from 'src/application/config';
import { formatAddressInline } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { Combobox } from './combobox';

const T = createTranslate('components.addressSearch');

type WithId<T> = T & { id: string };

type AddressSearchProps = {
  variant?: 'solid' | 'outlined';
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  error?: JSX.Element; // todo
  autofocus?: boolean;
  value?: Address;
  onChange: (address: Address | null) => void;
  classes?: Partial<Record<'root', string>>;
};

export function AddressSearch(props: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = createSignal('');

  const query = useQuery(() => ({
    enabled: searchQuery().length >= 3,
    queryKey: ['searchAddress', { query: searchQuery() }],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    async queryFn({ signal }) {
      if (!(await wait(1000, signal))) {
        return [];
      }

      return search(searchQuery());
    },
  }));

  const [selectedId, setSelectedId] = createSignal<string>();

  const { collection, set } = useListCollection<WithId<Address>>({
    initialItems: [],
    itemToString: formatAddressInline,
    itemToValue: (address) => address.id,
  });

  createRenderEffect(() => {
    untrack(() => {
      if (props.value) {
        const id = createId();

        setSelectedId(id);
        set([{ id, ...props.value }]);
      }
    });
  });

  createEffect(() => {
    if (query.isSuccess) {
      set(query.data);
    }
  });

  return (
    <Combobox
      collection={collection()}
      variant={props.variant}
      label={props.label}
      name={props.name}
      autofocus={props.autofocus}
      placeholder={props.placeholder}
      value={selectedId()}
      onChange={(address) => {
        assert(address !== null);
        setSelectedId(address.id);
        props.onChange(address);
      }}
      onClear={() => {
        setSelectedId(undefined);
        props.onChange(null);
      }}
      onInputValueChange={setSearchQuery}
      loading={query.isFetching}
      renderNoItems={() => (
        <div class="w-full py-6 text-center text-dim">
          <T id="noResults" />
        </div>
      )}
      classes={props.classes}
    />
  );
}

type Feature = {
  properties: Partial<{
    country: string;
    postcode: string;
    city: string;
    lon: number;
    lat: number;
    formatted: string;
    address_line1: string;
  }>;
};

type QueryResult = {
  features?: Feature[];
};

async function search(query: string): Promise<WithId<Address>[]> {
  const { geoapifyApiKey } = getAppConfig();

  const params = new URLSearchParams({
    text: query,
    apiKey: geoapifyApiKey,
  });

  const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`);

  // todo: report error
  if (!response.ok) {
    throw new Error(`Failed to search for address: ${response.statusText}`);
  }

  const body: QueryResult = await response.json();

  if (!body.features) {
    return [];
  }

  const getAddress = ({ properties }: Feature): WithId<Address> | undefined => {
    const { address_line1, city, postcode, country, lon, lat } = properties;

    if (!address_line1 || !city || !postcode || !country || !lon || !lat) {
      return;
    }

    return {
      id: createId(),
      line1: address_line1,
      city: city,
      postalCode: postcode,
      country: country,
      position: [lon, lat],
    };
  };

  return body.features.map(getAddress).filter(isDefined);
}
