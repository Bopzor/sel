import { createForm, Field, FormStore, getValue, submit } from '@modular-forms/solid';
import { createMutation } from '@tanstack/solid-query';
import { JSX } from 'solid-js';

import { api } from 'src/application/api';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Card } from 'src/components/card';
import { createTranslate } from 'src/intl/translate';

import { DeviceRegistration } from './device-registration';

const T = createTranslate('pages.profile.settings.notifications');

type FormType = {
  email: boolean;
  push: boolean;
};

export function NotificationSettings() {
  return (
    <Card title={<T id="title" />}>
      <p>
        <T id="description" />
      </p>

      <NotificationSettingsForm />
    </Card>
  );
}

export function NotificationSettingsForm() {
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const [form, { Form }] = createForm<FormType>({
    initialValues: member().notificationDelivery,
  });

  const mutation = createMutation(() => ({
    async mutationFn(body: FormType) {
      await api.updateNotificationDelivery({ path: { memberId: member().id }, body: body });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
    },
  }));

  return (
    <Form onSubmit={(data) => mutation.mutateAsync(data)}>
      <NotificationDeliveryOptions form={form} />
      <DeviceRegistration push={getValue(form, 'push')} />
    </Form>
  );
}

function NotificationDeliveryOptions(props: { form: FormStore<FormType> }) {
  const member = getAuthenticatedMember();

  return (
    <>
      <div role="radiogroup" class="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NotificationDeliveryOption form={props.form} type="email">
          <T id="email.description" values={{ email: member()?.email }} />
        </NotificationDeliveryOption>

        <NotificationDeliveryOption form={props.form} type="push">
          <T id="push.description" />
        </NotificationDeliveryOption>
      </div>
    </>
  );
}

function NotificationDeliveryOption(props: {
  form: FormStore<FormType>;
  type: 'email' | 'push';
  children: JSX.Element;
}) {
  return (
    <Field of={props.form} name={props.type} type="boolean">
      {(field, fieldProps) => (
        <label class="cursor-pointer rounded-sm border p-4 ring-primary has-checked:ring-3">
          <div class="row items-center gap-2">
            <input
              {...fieldProps}
              type="checkbox"
              checked={field.value}
              onChange={() => submit(props.form)}
              class="size-em"
            />

            <strong>
              <T id={`${props.type}.label`} />
            </strong>
          </div>

          <p class="mt-2">{props.children}</p>
        </label>
      )}
    </Field>
  );
}
