import { useAsyncList } from '@ark-ui/solid';
import { Combobox as ArkCombobox, createListCollection } from '@ark-ui/solid/combobox';
import { Address } from '@sel/shared';
import { isDefined } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { check } from 'solid-heroicons/solid';
import { createMemo, For, JSX, Match, Switch } from 'solid-js';

import { getAppConfig } from 'src/application/config';
import { formatAddressInline } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { Combobox } from './form-controls';
import { Spinner } from './spinner';

const T = createTranslate('components.addressSearch');

type AddressSearchProps = {
  variant?: 'solid' | 'outlined';
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  error?: JSX.Element;
  autofocus?: boolean;
  value?: Address;
  onChange: (address: Address | null) => void;
  classes?: { field?: string };
};

export function AddressSearch(props: AddressSearchProps) {
  const list = useAsyncList<Address>({
    async load({ filterText, signal }) {
      if (!filterText) {
        return { items: [] };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (signal?.aborted) {
        return { items: [] };
      }

      return {
        items: await search(filterText),
      };
    },
  });

  const collection = createMemo(() =>
    createListCollection({
      items: list().items,
      itemToString: formatAddressInline,
      itemToValue: formatAddressInline,
    }),
  );

  return (
    <Combobox
      collection={collection()}
      renderItem={() => null}
      variant={props.variant}
      label={props.label}
      name={props.name}
      autofocus={props.autofocus}
      placeholder={props.placeholder}
      value={props.value ? formatAddressInline(props.value) : undefined}
      onValueChange={(address) => props.onChange(collection().find(address))}
      defaultInputValue={props.value ? formatAddressInline(props.value) : undefined}
      onInputValueChange={({ inputValue, reason }) => {
        if (reason === 'input-change') {
          list().setFilterText(inputValue);
        }
      }}
      end={
        list().loading && (
          <div>
            <Spinner class="size-4" />
          </div>
        )
      }
      classes={props.classes}
    >
      <Switch>
        <Match when={list().loading}>
          <div class="w-full py-6 text-center text-dim">
            <T id="fetching" />
          </div>
        </Match>

        <Match when={list().error}>
          <div class="w-full py-6 text-center text-dim">{list().error.message}</div>
        </Match>

        <Match when={list().empty}>
          <div class="w-full py-6 text-center text-dim">
            {list().filterText ? <T id="noResults" /> : <T id="typeToSearch" />}
          </div>
        </Match>

        <Match when={true}>
          <For each={collection().items}>
            {(address) => (
              <ArkCombobox.Item item={address}>
                <ArkCombobox.ItemText>{formatAddressInline(address)}</ArkCombobox.ItemText>
                <ArkCombobox.ItemIndicator>
                  <Icon path={check} class="size-5" />
                </ArkCombobox.ItemIndicator>
              </ArkCombobox.Item>
            )}
          </For>
        </Match>
      </Switch>
    </Combobox>
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
