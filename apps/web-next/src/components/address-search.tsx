import { useLingui } from '@lingui/react/macro';
import type { Address } from '@sel/shared';
import { Icon, ListItem, Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { AddressSuggestion } from 'src/app/address-search';
import { queries } from 'src/app/queries';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';

const minSearchLength = 3;

export function useAddressSearch() {
  const { t } = useLingui();

  const [text, setText] = useState('');
  const [value, handleChange] = useDebouncedValue(text, setText, 1000);

  const search = text.trim();
  const enabled = search.length >= minSearchLength;
  const query = useQuery({ ...queries.searchAddresses(search), enabled });
  const suggestions = enabled ? (query.data ?? []) : [];

  const debouncing = value.trim() !== search && value.trim().length >= minSearchLength;
  const loading = debouncing || (enabled && query.isFetching);

  let status: string | undefined = undefined;

  if (enabled && !loading && suggestions.length === 0) {
    if (query.isError) {
      status = t`The search is not available at the moment. Enter the address manually.`;
    } else {
      status = t`No address found. Check what you typed, or enter the address manually.`;
    }
  }

  return {
    loading,
    suggestions,
    status,
    clear: () => setText(''),
    inputProps: {
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleChange(event.target.value),
    },
  };
}

type AddressSearchResults = {
  loading: boolean;
  suggestions: AddressSuggestion[];
  onSelect: (address: Address) => void;
};

export function AddressSearchResults({ loading, suggestions, onSelect }: AddressSearchResults) {
  const { t } = useLingui();

  if (loading) {
    return <AddressesSkeleton />;
  }

  if (suggestions.length > 0) {
    return (
      <ul aria-label={t`Addresses found`} className="rounded-md border">
        {suggestions.map(({ id, address }) => (
          <AddressSuggestion key={id} address={address} onSelect={() => onSelect(address)} />
        ))}
      </ul>
    );
  }

  return null;
}

function AddressesSkeleton() {
  const { t } = useLingui();

  return (
    <ul aria-label={t`Addresses found`} aria-busy className="rounded-md border">
      {[1, 2, 3].map((index) => (
        <ListItem.Root key={index}>
          <Skeleton variant="rect" className="size-icon-md" />
          <ListItem.Content className="gap-2">
            <Skeleton className="w-1/2" />
            <Skeleton className="w-1/4" />
          </ListItem.Content>
        </ListItem.Root>
      ))}
    </ul>
  );
}

function AddressSuggestion({ address, onSelect }: { address: Address; onSelect: () => void }) {
  return (
    <ListItem.Root className="first:rounded-t-md last:rounded-b-md">
      <Icon name="location" className="text-subtle" />
      <ListItem.Content>
        <ListItem.Title>
          <ListItem.Button onClick={onSelect}>{address.line1}</ListItem.Button>
        </ListItem.Title>
        <ListItem.Description>
          {address.postalCode} {address.city}
        </ListItem.Description>
      </ListItem.Content>
    </ListItem.Root>
  );
}
