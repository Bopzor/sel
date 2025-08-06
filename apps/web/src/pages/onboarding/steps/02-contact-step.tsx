import { createForm, Field, FormStore, toCustom } from '@modular-forms/solid';
import { AuthenticatedMember } from '@sel/shared';
import { useMutation } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { Show } from 'solid-js';
import { z } from 'zod';

import { api } from 'src/application/api';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { Input } from 'src/components/input';
import { Switch } from 'src/components/switch';
import { formatPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { createErrorMap, zodForm } from 'src/utils/validation';

const T = createTranslate('pages.onboarding.steps.contact');
const Translate = createTranslate('common');

const schema = z.object({
  email: z.string(),
  emailVisible: z.boolean(),
  phoneNumber: z
    .string()
    .refine((value) => value.replaceAll(' ', '').match(/^0\d{9}$/), { params: { invalid: true } }),
  phoneNumberVisible: z.boolean(),
});

type FormType = z.infer<typeof schema>;

export function ContactStep(props: { next: () => void }) {
  const t = T.useTranslate();
  const member = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const [form, { Form, Field }] = createForm<FormType>({
    initialValues: getInitialValues(member()),
    validate: zodForm(schema, {
      error: createErrorMap((error) => {
        if (error.path?.join('.') === 'phoneNumber' && error.code === 'custom' && error.params?.invalid) {
          return t('phoneNumber.invalid');
        }
      }),
    }),
  });

  const mutation = useMutation(() => ({
    async mutationFn({ emailVisible, phoneNumber, phoneNumberVisible }: FormType) {
      await api.updateMemberProfile({
        path: { memberId: member().id },
        body: {
          emailVisible,
          phoneNumbers: [{ number: phoneNumber.replaceAll(' ', ''), visible: phoneNumberVisible }],
        },
      });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      props.next();
    },
  }));

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

      <Form class="col gap-4" onSubmit={(data) => mutation.mutateAsync(data)}>
        <Field name="email">
          {(field, props) => (
            <Input
              {...props}
              readOnly
              variant="outlined"
              label={<T id="email.label" />}
              placeholder={t('email.placeholder')}
              helperText={<T id="email.readOnly" />}
              end={<ProfileFieldVisibility form={form} name="emailVisible" />}
              value={field.value}
              error={field.error}
            />
          )}
        </Field>

        <Field name="phoneNumber" transform={toCustom(phoneNumberTransformer, { on: 'blur' })}>
          {(field, props) => (
            <Input
              {...props}
              variant="outlined"
              label={<T id="phoneNumber.label" />}
              placeholder={t('phoneNumber.placeholder')}
              end={<ProfileFieldVisibility form={form} name="phoneNumberVisible" />}
              value={field.value}
              error={field.error}
            />
          )}
        </Field>

        <Button
          type="submit"
          loading={mutation.isPending}
          end={<Icon path={arrowRight} class="size-6" />}
          class="self-end"
        >
          <Translate id="next" />
        </Button>
      </Form>
    </>
  );
}

function getInitialValues(member: AuthenticatedMember) {
  const phoneNumber = member.phoneNumbers[0];

  return {
    email: member.email,
    emailVisible: member.emailVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber.number) : '',
    phoneNumberVisible: phoneNumber?.visible ?? true,
  };
}

function phoneNumberTransformer(input?: string) {
  return input
    ?.replaceAll(' ', '')
    .split('')
    .reduce((str, chr, idx, input) => (idx % 2 === 0 ? str + chr + (input[idx + 1] ?? '') + ' ' : str), '')
    .trim();
}

function ProfileFieldVisibility(props: {
  form: FormStore<FormType>;
  name: 'emailVisible' | 'phoneNumberVisible';
}) {
  return (
    <Field of={props.form} name={props.name} type="boolean">
      {(field, props) => (
        <Switch {...props} checked={field.value}>
          <Show when={field.value}>
            <Translate id="visible" />
          </Show>
          <Show when={!field.value}>
            <Translate id="notVisible" />
          </Show>
        </Switch>
      )}
    </Field>
  );
}
