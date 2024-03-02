import { Show, createSignal } from 'solid-js';

import { authenticatedMember } from '../../../app-context';
import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { TextArea } from '../../../components/text-area';
import { MemberAvatar } from '../../../components/member-avatar';
import { Translate } from '../../../intl/translate';

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
  return (
    <FormField label={<T id="profilePicture" />}>
      <div class="row items-center gap-2">
        <MemberAvatar member={authenticatedMember()} class="size-12 rounded-full" />
        <p>
          <T
            id="profilePictureMessage"
            values={{
              link: (children) => (
                <a target="_blank" href="https://fr.gravatar.com">
                  {children}
                </a>
              ),
            }}
          />
        </p>
      </div>
    </FormField>
  );
}
