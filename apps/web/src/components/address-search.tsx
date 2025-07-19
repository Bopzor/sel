import { Address } from '@sel/shared';
import { isDefined, wait } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import { ComponentProps, createSignal, splitProps } from 'solid-js';

import { getAppConfig } from 'src/application/config';
import { formatAddressInline } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { Autocomplete } from './autocomplete';

const T = createTranslate('components.addressSearch');

const forwardedAutocompleteProps = [
  'ref',
  'name',
  'label',
  'placeholder',
  'error',
  'variant',
  'width',
  'autofocus',
  'onBlur',
  'classes',
] satisfies Array<keyof ComponentProps<typeof Autocomplete>>;

type AddressSearchProps = Pick<
  ComponentProps<typeof Autocomplete>,
  (typeof forwardedAutocompleteProps)[number]
> & {
  placeholder?: string;
  selected?: Address;
  onSelected: (address: Address) => void;
};

export function AddressSearch(_props: AddressSearchProps) {
  const [autocompleteProps, props] = splitProps(_props, forwardedAutocompleteProps);

  const [searchQuery, setSearchQuery] = createSignal('');

  const query = useQuery(() => ({
    enabled: searchQuery().length >= 5,
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

  return (
    <Autocomplete<Address>
      {...autocompleteProps}
      loading={query.isFetching}
      items={query.data ?? []}
      itemToString={(result) => (result ? formatAddressInline(result) : '')}
      selectedItem={() => props.selected ?? null}
      onItemSelected={(address) => props.onSelected(address)}
      onSearch={(value) => setSearchQuery(value)}
      renderItem={formatAddressInline}
      renderNoItems={({ inputValue }) =>
        inputValue.length >= 5 &&
        !query.isFetching && (
          <div class="w-full py-6 text-center text-dim">
            <T id="noResults" />
          </div>
        )
      }
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

async function search(query: string): Promise<Address[]> {
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

  const getAddress = ({ properties }: Feature): Address | undefined => {
    const { address_line1, city, postcode, country, lon, lat } = properties;

    if (!address_line1 || !city || !postcode || !country || !lon || !lat) {
      return;
    }

    return {
      line1: address_line1,
      city: city,
      postalCode: postcode,
      country: country,
      position: [lon, lat],
    };
  };

  return body.features.map(getAddress).filter(isDefined);
}
