import { assert } from '@sel/utils';
import { createMutation } from '@tanstack/solid-query';
import { Show, createSignal } from 'solid-js';

import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { MemberAvatar } from '../../../components/member-avatar';
import { TextArea } from '../../../components/text-area';
import { useInvalidateApi } from '../../../infrastructure/api';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember } from '../../../utils/authenticated-member';
import { notify } from '../../../utils/notify';

import { type ProfileEditionForm } from './profile-edition.page';
import { ProfileFieldVisibility } from './profile-field-visibility';

const T = Translate.prefix('profile.profile');

export function ProfileEditionForm(props: Pick<ProfileEditionForm, 'form' | 'data' | 'errors'>) {
  // @ts-expect-error solidjs directive
  // eslint-disable-next-line solid/reactivity
  const { form } = props;

  return (
    <form id="profile-form" use:form class="col gap-6">
      <NameFields errors={props.errors} />
      <EmailField data={props.data} errors={props.errors} />
      <PhoneNumberField data={props.data} errors={props.errors} />
      <BioField errors={props.errors} />
      <ProfilePictureField />
    </form>
  );
}

function NameFields(props: Pick<ProfileEditionForm, 'errors'>) {
  return (
    <div class="row gap-4">
      <FormField label={<T id="firstName" />} error={props.errors('firstName')} class="flex-1">
        <Input name="firstName" />
      </FormField>

      <FormField label={<T id="lastName" />} error={props.errors('lastName')} class="flex-1">
        <Input name="lastName" />
      </FormField>
    </div>
  );
}

function EmailField(props: Pick<ProfileEditionForm, 'data' | 'errors'>) {
  const [emailReadOnlyMessageVisible, setEmailReadOnlyMessageVisible] = createSignal(false);

  return (
    <FormField label={<T id="emailAddress" />} error={props.errors('email')}>
      <div class="row items-center gap-4">
        <Input
          name="email"
          type="email"
          width="medium"
          readOnly
          onFocus={() => setEmailReadOnlyMessageVisible(true)}
          onBlur={() => setEmailReadOnlyMessageVisible(false)}
        />
        <ProfileFieldVisibility name="emailVisible" data={props.data} />
      </div>

      <Show when={emailReadOnlyMessageVisible()}>
        <p class="text-sm text-dim">
          <T id="emailAddressReadOnly" />
        </p>
      </Show>
    </FormField>
  );
}

function PhoneNumberField(props: Pick<ProfileEditionForm, 'data' | 'errors'>) {
  return (
    <FormField label={<T id="phoneNumber" />} error={props.errors('phoneNumber')}>
      <div class="row items-center gap-4">
        <Input name="phoneNumber" type="tel" width="medium" />
        <ProfileFieldVisibility name="phoneNumberVisible" data={props.data} />
      </div>
    </FormField>
  );
}

function BioField(props: Pick<ProfileEditionForm, 'errors'>) {
  return (
    <FormField label={<T id="bio" />} error={props.errors('bio')}>
      <TextArea name="bio" width="full" rows={6} />
    </FormField>
  );
}

function ProfilePictureField() {
  const authenticatedMember = getAuthenticatedMember();

  const t = T.useTranslation();
  const invalidate = useInvalidateApi();

  const api = container.resolve(TOKENS.api);

  const mutation = createMutation(() => ({
    async mutationFn(file: File) {
      const fileName = await api.uploadFile({ files: { file } });

      await api.updateMemberProfile({
        path: { memberId: authenticatedMember()!.id },
        body: { avatarFileName: fileName },
      });
    },
    async onSuccess() {
      await invalidate(['getAuthenticatedMember']);
      notify.success(t('profilePictureChanged'));
      input.value = '';
    },
  }));

  let input!: HTMLInputElement;

  return (
    <FormField label={<T id="profilePicture" />}>
      <div class="row items-center gap-4">
        <MemberAvatar member={authenticatedMember()} class="size-12 rounded-full" />

        <div class="col gap-2">
          <p>
            <T id="profilePictureMessage" />
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
    </FormField>
  );
}
