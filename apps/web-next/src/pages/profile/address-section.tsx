import { Trans, useLingui } from '@lingui/react/macro';
import { updateMemberProfileBodySchema, type Address, type AuthenticatedMember } from '@sel/shared';
import { Button, FormField, Icon, Input } from '@sel/ui';
import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type z from 'zod';

import { formatAddressLines } from 'src/app/format';
import { AddressSearchResults, useAddressSearch } from 'src/components/address-search';
import { InputField, submitWithMutation } from 'src/components/fields';
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
  const addressSearch = useAddressSearch();
  const [mode, setMode] = useState<'search' | 'manual'>(member.address ? 'manual' : 'search');
  const [focus, setFocus] = useState(false);

  const form = useForm({
    resolver: useZodResolver(useSchema()),
    defaultValues: { address: toFormValues(member.address ?? {}) },
  });

  const mutation = useUpdateProfileMutation({
    onSuccess: onClose,
    onError: useFormApiError(form),
  });

  const setAddress = (address: Partial<Address>) => {
    form.setValue('address', toFormValues(address), { shouldDirty: true });
    form.clearErrors('address');
  };

  const onSelect = (address: Address) => {
    setAddress(address);
    setFocus(true);
    setMode('manual');
  };

  const showSearch = () => {
    form.clearErrors('address');
    setFocus(true);
    setMode('search');
  };

  const onRemove = () => {
    setAddress({});
    showSearch();
  };

  return (
    <ProfileSectionForm
      formState={form.formState}
      title={title}
      onCancel={onClose}
      onSubmit={submitWithMutation(form, mutation, { onInvalid: () => setMode('manual') })}
    >
      {mode === 'search' && (
        <div className="stack gap-3">
          <FormField
            label={<Trans>Search for an address</Trans>}
            hint={<Trans>For example, 12 rue de la Paix, Lyon</Trans>}
          >
            <Input
              type="search"
              icon="search"
              // Enter would submit the form, and save the address that was there before the search.
              onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
              autoFocus={focus}
              {...addressSearch.inputProps}
            />
          </FormField>

          <p aria-live="polite" className="text-body-sm text-muted empty:hidden">
            {addressSearch.status}
          </p>

          <AddressSearchResults {...addressSearch} onSelect={onSelect} />

          <Button variant="secondary" size="sm" onClick={() => setMode('manual')} className="self-start">
            <Trans>Manual entry</Trans>
          </Button>
        </div>
      )}

      {mode === 'manual' && (
        <>
          <ManualAddressFields form={form} />

          <div className="row flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={showSearch}>
              <Trans>Search for an address</Trans>
            </Button>

            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trans>Remove my address</Trans>
            </Button>
          </div>
        </>
      )}
    </ProfileSectionForm>
  );
}

type AddressSchema = ReturnType<typeof useSchema>;

type ManualAddressFieldsProps = {
  form: UseFormReturn<z.input<AddressSchema>, unknown, z.output<AddressSchema>>;
};

function ManualAddressFields({ form }: ManualAddressFieldsProps) {
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
