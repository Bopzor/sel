import { createForm, setValue, submit } from '@modular-forms/solid';
import { Address } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';

import { api } from 'src/application/api';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { AddressSearch } from 'src/components/address-search';
import { Button } from 'src/components/button';
import { Map } from 'src/components/map';
import { formatAddressInline } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { when } from 'src/utils/when';

const T = createTranslate('pages.onboarding.steps.address');
const Translate = createTranslate('common');

export function AddressStep(props: { next: () => void }) {
  const [, { Form }] = createForm();

  return (
    <>
      <div class="col gap-4">
        <p>
          <T id="sentence1" />
        </p>
        <p class="text-sm text-dim">
          <T id="sentence2" />
        </p>
      </div>

      <AddressForm />

      <Form class="col" onSubmit={() => props.next()}>
        <Button type="submit" end={<Icon path={arrowRight} class="size-6" />} class="self-end">
          <Translate id="next" />
        </Button>
      </Form>
    </>
  );
}

function AddressForm() {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, { Form, Field }] = createForm<{ address: any }>({
    initialValues: {
      address: member().address,
    },
  });

  const mutation = useMutation(() => ({
    async mutationFn(address: Address) {
      await api.updateMemberProfile({ path: { memberId: member().id }, body: { address } });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
    },
  }));

  return (
    <Form onSubmit={({ address }) => mutation.mutateAsync(address)} class="col gap-4">
      <Field name="address">
        {(field, props) => (
          <AddressSearch
            ref={props.ref}
            name={props.name}
            autofocus={props.autofocus}
            error={field.error}
            selected={field.value}
            variant="outlined"
            placeholder={t('address.placeholder')}
            onSelected={(address) => {
              if (formatAddressInline(address) !== formatAddressInline(field.value)) {
                setValue(form, 'address', address);
                submit(form);
              }
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
        class="min-h-96"
      />
    </Form>
  );
}
