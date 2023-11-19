import { createForm } from '@felte/solid';
import { Component } from 'solid-js';

import { selectAuthenticatedMember } from '../authentication/authentication.slice';
import { Button } from '../components/button';
import { FormField } from '../components/form-field';
import { Input, TextArea } from '../components/input';
import { MemberAvatar } from '../components/member-avatar';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Row } from '../components/row';
import { Translate } from '../intl/translate';
import { selector } from '../store/selector';

import { ProfileFieldVisibility } from './components/profile-field-visibility';

const T = Translate.prefix('profile.profile');

export const ProfilePage: Component = () => {
  const t = T.useTranslation();
  const member = selector(selectAuthenticatedMember);

  const { form, data, isDirty } = createForm({
    initialValues: {
      firstName: member().firstName,
      lastName: member().lastName,
      email: member().email,
      emailVisible: member().emailVisible,
      phoneNumber: member().phoneNumbers[0].number,
      phoneNumberVisible: member().phoneNumbers[0].visible,
      bio: member().bio,
    },
    async onSubmit(values) {
      console.log(values);
    },
  });

  return (
    <>
      <Row gap={4}>
        <MemberAvatarName member={member()} classes={{ avatar: '!w-20 !h-20', name: 'text-3xl' }} />

        <Row
          gap={2}
          class="ml-auto transition-opacity"
          classList={{ 'opacity-0 pointer-events-none': !isDirty() }}
        >
          <Button variant="secondary" type="reset" form="profile-form">
            <T id="reset" />
          </Button>

          <Button type="submit" form="profile-form">
            <T id="save" />
          </Button>
        </Row>
      </Row>

      <hr class="w-full" />

      <form id="profile-form" use:form class="col gap-6">
        <Row gap={4}>
          <FormField label={t('firstName')} class="flex-1">
            <Input name="firstName" />
          </FormField>

          <FormField label={t('lastName')} class="flex-1">
            <Input name="lastName" />
          </FormField>
        </Row>

        <FormField label={t('emailAddress')}>
          <Row gap={4}>
            <Input name="email" width="medium" readOnly />
            <ProfileFieldVisibility name="emailVisible" data={data} />
          </Row>
        </FormField>

        <FormField label={t('phoneNumber')}>
          <Row gap={4}>
            <Input name="phoneNumber" width="medium" />
            <ProfileFieldVisibility name="phoneNumberVisible" data={data} />
          </Row>
        </FormField>

        <FormField label={t('bio')}>
          <TextArea name="bio" width="full" rows={6} />
        </FormField>

        <FormField label={t('profilePicture')}>
          <Row gap={2}>
            <MemberAvatar member={member()} class="h-12 w-12 rounded-full" />
            <p>
              <T
                id="profilePictureMessage"
                values={{ link: (children) => <a href="https://fr.gravatar.com">{children}</a> }}
              />
            </p>
          </Row>
        </FormField>
      </form>
    </>
  );
};
