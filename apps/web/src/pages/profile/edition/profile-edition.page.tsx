import { createForm, Field, FormStore, reset } from '@modular-forms/solid';
import { AuthenticatedMember, UpdateMemberProfileData } from '@sel/shared';
import { assert } from '@sel/utils';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';
import { z } from 'zod';

import { api } from 'src/application/api';
import { notify } from 'src/application/notify';
import { getAuthenticatedMember, useInvalidateApi } from 'src/application/query';
import { Button } from 'src/components/button';
import { FormControl } from 'src/components/form-control';
import { Input } from 'src/components/input';
import { MemberAvatar, MemberAvatarName } from 'src/components/member-avatar-name';
import { Switch } from 'src/components/switch';
import { TextArea } from 'src/components/text-area';
import { formatPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';
import { createId } from 'src/utils/id';
import { createErrorMap, zodForm } from 'src/utils/validation';

const Translate = createTranslate('common');
const T = createTranslate('pages.profile.edition');

const schema = z.object({
  firstName: z.string().trim().min(1).max(256),
  lastName: z.string().trim().min(1).max(256),
  emailVisible: z.boolean(),
  phoneNumber: z
    .string()
    .transform((value) => value.replace(/^\+33/, '0'))
    .transform((value) => value.replaceAll(' ', ''))
    .refine((value) => value.match(/^0\d{9}$/), { params: { phoneNumberInvalid: true } }),
  phoneNumberVisible: z.boolean(),
  bio: z.string().trim().max(4096).optional(),
});

type FormType = z.infer<typeof schema>;

export function ProfileEditionPage() {
  const member = getAuthenticatedMember();

  return <Show when={member()}>{(member) => <ProfileEditionForm initialValues={member()} />}</Show>;
}

function ProfileEditionForm(props: { initialValues: AuthenticatedMember }) {
  const t = T.useTranslate();
  const invalidate = useInvalidateApi();
  const queryClient = useQueryClient();

  const [form, { Form }] = createForm<FormType>({
    initialValues: getInitialValues(props.initialValues),
    validate: zodForm(schema, {
      error: createErrorMap((error) => {
        if (error.code === 'custom' && error.params?.phoneNumberInvalid) {
          return t('phoneNumber.invalid');
        }
      }),
    }),
  });

  const mutation = useMutation(() => ({
    async mutationFn(data: UpdateMemberProfileData) {
      await api.updateMemberProfile({ path: { memberId: props.initialValues.id }, body: data });
    },
    async onSuccess() {
      await Promise.all([invalidate('getAuthenticatedMember'), invalidate('listMembers')]);

      const member = queryClient.getQueryData(['getAuthenticatedMember', {}]) as AuthenticatedMember;
      reset(form, { initialValues: getInitialValues(member) });
    },
  }));

  return (
    <Form onSubmit={(data) => mutation.mutateAsync(data)} class="col gap-8">
      <Header form={form} />

      <hr class="w-full" />

      <NameFields form={form} />
      <EmailField form={form} value={props.initialValues.email} />
      <PhoneNumberField form={form} />
      <BioField form={form} />
      <ProfilePictureField />
    </Form>
  );
}

function getInitialValues(member: AuthenticatedMember): FormType {
  const phoneNumber = member.phoneNumbers[0];

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    emailVisible: member.emailVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber?.number) : '',
    phoneNumberVisible: phoneNumber?.visible ?? true,
    bio: member.bio ?? '',
  };
}

function Header(props: { form: FormStore<FormType> }) {
  const authenticatedMember = getAuthenticatedMember();

  return (
    <header class="row flex-wrap-reverse items-center gap-4">
      <MemberAvatarName
        member={authenticatedMember()}
        classes={{ avatar: 'size-20!', name: 'text-3xl font-semibold', root: 'gap-6' }}
      />

      <div
        class="ml-auto row gap-2 transition-opacity"
        classList={{ 'opacity-0 pointer-events-none': !props.form.dirty }}
      >
        <Button variant="outline" onClick={() => reset(props.form)}>
          <Translate id="cancel" />
        </Button>

        <Button type="submit" loading={props.form.submitting}>
          <Translate id="save" />
        </Button>
      </div>
    </header>
  );
}

function NameFields(props: { form: FormStore<FormType> }) {
  return (
    <div class="row gap-4">
      <Field of={props.form} name="firstName">
        {(field, props) => (
          <Input
            {...props}
            label={<T id="firstName.label" />}
            value={field.value}
            error={field.error}
            classes={{ root: 'flex-1' }}
          />
        )}
      </Field>

      <Field of={props.form} name="lastName">
        {(field, props) => (
          <Input
            {...props}
            label={<T id="lastName.label" />}
            value={field.value}
            error={field.error}
            classes={{ root: 'flex-1' }}
          />
        )}
      </Field>
    </div>
  );
}

function EmailField(props: { form: FormStore<FormType>; value: string }) {
  const [emailReadOnlyMessageVisible, setEmailReadOnlyMessageVisible] = createSignal(false);

  return (
    <Input
      readOnly
      name="email"
      type="email"
      label={<T id="emailAddress.label" />}
      value={props.value}
      helperText={emailReadOnlyMessageVisible() ? <T id="emailAddress.readOnly" /> : undefined}
      onFocus={() => setEmailReadOnlyMessageVisible(true)}
      onBlur={() => setEmailReadOnlyMessageVisible(false)}
      end={<ProfileFieldVisibility name="emailVisible" form={props.form} />}
      classes={{ root: 'max-w-md' }}
    />
  );
}

function PhoneNumberField(props: { form: FormStore<FormType> }) {
  return (
    <Field of={props.form} name="phoneNumber">
      {(field, inputProps) => (
        <Input
          {...inputProps}
          name="phoneNumber"
          type="tel"
          label={<T id="phoneNumber.label" />}
          value={field.value}
          error={field.error}
          end={<ProfileFieldVisibility form={props.form} name="phoneNumberVisible" />}
          classes={{ root: 'max-w-md' }}
        />
      )}
    </Field>
  );
}

function BioField(props: { form: FormStore<FormType> }) {
  return (
    <Field of={props.form} name="bio">
      {(field, props) => (
        <TextArea
          {...props}
          label={<T id="bio.label" />}
          value={field.value}
          error={field.error}
          rows={6}
          classes={{ field: 'h-auto' }}
        />
      )}
    </Field>
  );
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

function ProfilePictureField() {
  const member = getAuthenticatedMember();

  const t = T.useTranslate();
  const invalidate = useInvalidateApi();

  const mutation = useMutation(() => ({
    async mutationFn(file: File) {
      const uploadedFile = await api.uploadFile({ files: { file } });

      await api.updateMemberProfile({
        path: { memberId: member().id },
        // todo: send file id
        body: { avatarFileName: uploadedFile.name },
      });
    },
    async onSuccess() {
      await invalidate('getAuthenticatedMember');
      notify.success(t('profilePicture.changed'));
      input.value = '';
    },
  }));

  const id = createId(() => undefined);
  let input!: HTMLInputElement;

  return (
    <FormControl id={id()} label={<T id="profilePicture.label" />}>
      <div class="row items-center gap-4">
        <MemberAvatar member={member()} class="size-12 rounded-full" />

        <div class="col gap-2">
          <p>
            <T id="profilePicture.message" />
          </p>

          <input
            ref={input}
            type="file"
            accept=".bmp,.gif,.jpg,.jpeg,.png"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];

              assert(file instanceof File);
              mutation.mutate(file);
            }}
          />
        </div>
      </div>
    </FormControl>
  );
}
