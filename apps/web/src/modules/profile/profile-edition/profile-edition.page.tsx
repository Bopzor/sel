import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import { AuthenticatedMember } from '@sel/shared';
import { createEffect } from 'solid-js';

import { getAppActions, authenticatedMember } from '../../../app-context';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { formatPhoneNumber } from '../../../utils/format-phone-number';
import { notify } from '../../../utils/notify';

import { ProfileEditionForm } from './profile-edition-form';
import { ProfileEditionHeader } from './profile-edition-header';

const T = Translate.prefix('profile.profile');

export default function ProfileEditionPage() {
  const { form, data, errors, isDirty, isSubmitting } = createProfileEditionForm();

  return (
    <>
      <div class="row items-center gap-4">
        <ProfileEditionHeader isDirty={isDirty()} isSubmitting={isSubmitting()} />
      </div>

      <hr class="w-full" />

      <ProfileEditionForm form={form} data={data} errors={errors} />
    </>
  );
}

function createProfileEditionForm() {
  const t = T.useTranslation();
  const { refreshAuthenticatedMember } = getAppActions();

  const profileApi = container.resolve(TOKENS.profileApi);
  const member = authenticatedMember();

  const form = createForm<ReturnType<typeof getInitialValues>>({
    extend: validator({ schema: schema() }),
    async onSubmit(values) {
      await profileApi.updateMemberProfile(member?.id as string, {
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
        address: member?.address,
      });
    },
    onSuccess() {
      notify.success(t('saved'));
      refreshAuthenticatedMember();
    },
  });

  createEffect(() => {
    form.setInitialValues(getInitialValues(authenticatedMember()));
    form.reset();
  });

  return form;
}

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

const getInitialValues = (member: AuthenticatedMember | undefined) => ({
  firstName: member?.firstName ?? '',
  lastName: member?.lastName ?? '',
  email: member?.email ?? '',
  emailVisible: member?.emailVisible ?? true,
  phoneNumber: member ? formatPhoneNumber(member.phoneNumbers[0].number) : undefined ?? '',
  phoneNumberVisible: member?.phoneNumbers[0].visible ?? true,
  bio: member?.bio ?? '',
});

export type ProfileEditionForm = ReturnType<typeof createProfileEditionForm>;
