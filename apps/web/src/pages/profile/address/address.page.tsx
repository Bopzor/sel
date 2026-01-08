import { createForm, reset, setValue, submit } from '@modular-forms/solid';
import { Address, AuthenticatedMember } from '@sel/shared';
import { useMutation, useQueryClient } from '@tanstack/solid-query';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { AddressSearch } from 'src/components/address-search';
import { Map } from 'src/components/map';
import { createTranslate } from 'src/intl/translate';
import { when } from 'src/utils/when';

const T = createTranslate('pages.profile.address');

export function AddressPage() {
  const t = T.useTranslate();

  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, { Form, Field }] = createForm<{ address: any }>({
    initialValues: {
      address: member().address,
    },
  });

  const mutation = useMutation(() => ({
    async mutationFn(address: Address | null) {
      await api.updateMemberProfile({ path: { memberId: member().id }, body: { address } });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');

      const member = queryClient.getQueryData(['getAuthenticatedMember', {}]) as AuthenticatedMember;
      reset(form, { initialValues: { address: member.address } });

      notify.success(t('changed'));
    },
  }));

  return (
    <Form onSubmit={({ address }) => mutation.mutateAsync(address)} class="col gap-4">
      <Field name="address">
        {(field, props) => (
          <AddressSearch
            name={props.name}
            placeholder={t('placeholder')}
            autofocus={props.autofocus}
            error={field.error}
            value={field.value}
            onChange={(address) => {
              setValue(form, 'address', address);
              submit(form);
            }}
          />
        )}
      </Field>

      <Map
        zoom={13}
        center={member().address?.position}
        markers={when(
          member().address?.position,
          (position) => [{ position }],
          () => undefined,
        )}
        class="min-h-128"
      />
    </Form>
  );
}
