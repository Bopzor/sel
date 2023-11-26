import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import { AuthenticatedMember, UpdateMemberProfileData } from '@sel/shared';
import { Component, Show, createEffect, createSignal } from 'solid-js';

import { Button } from '../components/button';
import { FormField } from '../components/form-field';
import { Input, TextArea } from '../components/input';
import { MemberAvatar } from '../components/member-avatar';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Row } from '../components/row';
import { Translate } from '../intl/translate';
import { getAuthenticatedMember } from '../utils/authenticated-member';
import { formatPhoneNumber } from '../utils/format-phone-number';
import { mutation } from '../utils/mutation';

import { ProfileFieldVisibility } from './components/profile-field-visibility';

const T = Translate.prefix('profile.profile');

const schema = () => {
  const t = T.useTranslation();
  const z = Translate.zod();

  return z.object({
    firstName: z.string().trim().min(1).max(256),
    lastName: z.string().trim().min(1).max(256),
    phoneNumber: z
      .string()
      .transform((value) => value.replace(/^\+33/, '0'))
      .transform((value) => value.replaceAll(' ', ''))
      .refine((value) => value.match(/^0\d{9}$/), t('phoneNumberInvalid')),
    bio: z.string().trim().max(4096).optional(),
    address: z
      .object({
        line1: z.string().trim().max(256),
        line2: z.string().trim().max(256).optional(),
        postalCode: z.string().trim().max(16),
        city: z.string().trim().max(256),
        country: z.string().trim().max(256),
        position: z.tuple([z.number(), z.number()]).optional(),
      })
      .optional(),
  });
};

const getInitialValues = (member: AuthenticatedMember) => ({
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.email,
  emailVisible: member.emailVisible,
  phoneNumber: formatPhoneNumber(member.phoneNumbers[0].number),
  phoneNumberVisible: member.phoneNumbers[0].visible,
  bio: member.bio ?? '',
});

export const ProfileEditionPage: Component = () => {
  const t = T.useTranslation();
  const member = getAuthenticatedMember();

  const [updateMemberProfile] = mutation((fetcher) => ({
    key: ['updateMemberProfile'],
    async mutate(data: UpdateMemberProfileData) {
      await fetcher.put(`/api/members/${member().id}/profile`, data);
    },
    invalidate: [['authenticatedMember']],
  }));

  const { form, data, errors, isDirty, setInitialValues, reset } = createForm({
    initialValues: getInitialValues(member()),
    extend: validator({ schema: schema() }),
    onSubmit(values) {
      updateMemberProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        emailVisible: values.emailVisible,
        phoneNumbers: [
          {
            number: values.phoneNumber.replace(/^\+33/, '0').replaceAll(' ', ''),
            visible: values.phoneNumberVisible,
          },
        ],
        bio: values.bio,
      });
    },
  });

  createEffect(() => {
    setInitialValues(getInitialValues(member()));
    reset();
  });

  const [emailReadOnlyMessageVisible, setEmailReadOnlyMessageVisible] = createSignal(false);

  return (
    <>
      <Row gap={4}>
        <MemberAvatarName member={member()} classes={{ avatar: '!w-20 !h-20', name: 'typo-h1' }} />

        <div
          class="col sm:row ml-auto gap-2 transition-opacity"
          classList={{ 'opacity-0 pointer-events-none': !isDirty() }}
        >
          <Button variant="secondary" type="reset" form="profile-form">
            <T id="reset" />
          </Button>

          <Button type="submit" form="profile-form">
            <T id="save" />
          </Button>
        </div>
      </Row>

      <hr class="w-full" />

      <form id="profile-form" use:form class="col gap-6">
        <div class="row gap-4">
          <FormField label={t('firstName')} error={errors('firstName')} class="flex-1">
            <Input name="firstName" />
          </FormField>

          <FormField label={t('lastName')} error={errors('lastName')} class="flex-1">
            <Input name="lastName" />
          </FormField>
        </div>

        <FormField label={t('emailAddress')} error={errors('email')}>
          <Row gap={4}>
            <Input
              name="email"
              type="email"
              width="medium"
              readOnly
              onFocus={() => setEmailReadOnlyMessageVisible(true)}
              onBlur={() => setEmailReadOnlyMessageVisible(false)}
            />
            <ProfileFieldVisibility name="emailVisible" data={data} />
          </Row>
          <Show when={emailReadOnlyMessageVisible()}>
            <p class="text-sm text-dim">
              <T id="emailAddressReadOnly" />
            </p>
          </Show>
        </FormField>

        <FormField label={t('phoneNumber')} error={errors('phoneNumber')}>
          <Row gap={4}>
            <Input name="phoneNumber" type="tel" width="medium" />
            <ProfileFieldVisibility name="phoneNumberVisible" data={data} />
          </Row>
        </FormField>

        <FormField label={t('bio')} error={errors('bio')}>
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
