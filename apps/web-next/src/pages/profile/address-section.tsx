import { Trans, useLingui } from '@lingui/react/macro';
import { updateMemberProfileBodySchema, type Address, type AuthenticatedMember } from '@sel/shared';
import { Button, FormField, Icon, Input, ListItem, Skeleton } from '@sel/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import z from 'zod';

import { formatAddressLines } from 'src/app/format';
import { queries } from 'src/app/queries';
import { InputField, submitWithMutation } from 'src/components/fields';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import {
  ProfileInfoVisibility,
  ProfileSection,
  ProfileSectionForm,
  useSectionEditing,
  useUpdateProfileMutation,
} from './profile-section';

export function AddressSection({ member }: { member: AuthenticatedMember }) {
  const section = useSectionEditing();
  const title = <Trans>Address</Trans>;

  if (section.editing) {
    return <AddressForm title={title} member={member} onClose={section.close} />;
  }

  return (
    <ProfileSection title={title} onEdit={section.edit} focusEdit={section.focusEdit}>
      {!member.address && (
        <p className="text-muted">
          <Trans>You have not entered your address yet.</Trans>
        </p>
      )}

      {member.address && (
        <div className="row items-start gap-3">
          <Icon name="location" className="mt-0.5 text-subtle" />

          <div className="stack min-w-0">
            <p className="wrap-break-word whitespace-pre-line">
              {formatAddressLines(member.address).join('\n')}
            </p>
            <ProfileInfoVisibility visible />
          </div>
        </div>
      )}
    </ProfileSection>
  );
}

type AddressFormProps = {
  title: React.ReactNode;
  member: AuthenticatedMember;
  onClose: () => void;
};

function AddressForm({ title, member, onClose }: AddressFormProps) {
  const [mode, setMode] = useState<'search' | 'manual'>(member.address === undefined ? 'search' : 'manual');

  const form = useForm({
    resolver: useZodResolver(useSchema()),
    defaultValues: { address: toFormValues(member.address ?? {}) },
  });

  const mutation = useUpdateProfileMutation({
    onSuccess: onClose,
    onError: useFormApiError(form),
  });

  return (
    <ProfileSectionForm
      formState={form.formState}
      title={title}
      onCancel={onClose}
      onSubmit={submitWithMutation(form, mutation, { onInvalid: () => setMode('manual') })}
    >
      {mode === 'search' && (
        <>
          <AddressSearch
            onSelect={(address) => {
              form.reset({ address: toFormValues(address) }, { keepDefaultValues: true });
              setMode('manual');
            }}
          />

          <Button variant="secondary" size="sm" onClick={() => setMode('manual')} className="self-start">
            <Trans>Manual entry</Trans>
          </Button>
        </>
      )}

      {mode === 'manual' && <ManualAddressForm form={form} onSearch={() => setMode('search')} />}
    </ProfileSectionForm>
  );
}

const minSearchLength = 3;

function AddressSearch({ onSelect }: { onSelect: (address: Address) => void }) {
  const { t } = useLingui();

  const [text, setText] = useState('');
  const [value, handleChange] = useDebouncedValue(text, setText, 1000);

  const search = text.trim();
  const enabled = search.length >= minSearchLength;
  const query = useQuery({ ...queries.searchAddresses(search), enabled });
  const suggestions = enabled ? (query.data ?? []) : [];

  const debouncing = value.trim() !== search && value.trim().length >= minSearchLength;
  const loading = debouncing || (enabled && query.isFetching);

  const getStatus = () => {
    if (!enabled || loading || suggestions.length > 0) {
      return undefined;
    }

    if (query.isError) {
      return t`The search is not available at the moment. Enter your address manually.`;
    }

    return t`No address found. Check what you typed, or enter your address manually.`;
  };

  return (
    <div className="stack gap-3">
      <FormField
        label={<Trans>Search for an address</Trans>}
        hint={<Trans>For example, 12 rue de la Paix, Lyon</Trans>}
      >
        <Input
          type="search"
          icon="search"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          // Enter would submit the form, and save the address that was there before the search.
          onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
          autoFocus
        />
      </FormField>

      <p aria-live="polite" className="text-body-sm text-muted empty:hidden">
        {getStatus()}
      </p>

      {loading && <AddressesSkeleton />}

      {!loading && suggestions.length > 0 && (
        <ul aria-label={t`Addresses found`} className="rounded-md border">
          {suggestions.map(({ id, address }) => (
            <AddressSuggestion key={id} address={address} onSelect={() => onSelect(address)} />
          ))}
        </ul>
      )}
    </div>
  );
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
    <ListItem.Root>
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

type AddressSchema = ReturnType<typeof useSchema>;

type ManualAddressFormProps = {
  form: UseFormReturn<z.input<AddressSchema>, unknown, z.output<AddressSchema>>;
  onSearch: () => void;
};

function ManualAddressForm({ form, onSearch }: ManualAddressFormProps) {
  const removeAddress = () => {
    form.reset({ address: toFormValues({}) }, { keepDefaultValues: true });
    onSearch();
  };

  // An address changed by hand is no longer at the position found by the search.
  const clearPosition = () => {
    form.setValue('address.position', undefined);
  };

  return (
    <>
      <InputField
        control={form.control}
        name="address.line1"
        label={<Trans>Number and street</Trans>}
        autoComplete="address-line1"
        onChange={clearPosition}
        autoFocus
      />

      <InputField
        control={form.control}
        name="address.line2"
        label={<Trans>Address complement (optional)</Trans>}
        autoComplete="address-line2"
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <InputField
          control={form.control}
          name="address.postalCode"
          label={<Trans>Postal code</Trans>}
          autoComplete="postal-code"
          inputMode="numeric"
          onChange={clearPosition}
        />

        <div className="sm:col-span-2">
          <InputField
            control={form.control}
            name="address.city"
            label={<Trans>City</Trans>}
            autoComplete="address-level2"
            onChange={clearPosition}
          />
        </div>
      </div>

      <div className="row flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onSearch}>
          <Trans>Search for an address</Trans>
        </Button>

        <Button variant="ghost" size="sm" onClick={removeAddress}>
          <Trans>Remove my address</Trans>
        </Button>
      </div>
    </>
  );
}

function toFormValues(address: Partial<Address>) {
  return {
    line1: address.line1 ?? '',
    line2: address.line2 ?? '',
    postalCode: address.postalCode ?? '',
    city: address.city ?? '',
    country: address.country ?? '',
    position: address.position,
  };
}

function useSchema() {
  const { t } = useLingui();

  return updateMemberProfileBodySchema
    .pick({ address: true })
    .transform(({ address }) => {
      if (address?.line1 === '' && address.postalCode === '' && address.city === '') {
        return { address: null };
      }

      if (address?.line2 === '') {
        delete address.line2;
      }

      if (address?.country === '') {
        address.country = 'France';
      }

      return { address };
    })
    .superRefine(({ address }, ctx) => {
      if (address == null) {
        return;
      }

      const required = (field: string) => {
        ctx.addIssue({ code: 'custom', path: ['address', field], message: t`This field is required` });
      };

      if (address.line1 === '') required('line1');
      if (address.postalCode === '') required('postalCode');
      if (address.city === '') required('city');
    });
}
