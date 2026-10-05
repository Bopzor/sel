import { Trans, useLingui } from '@lingui/react/macro';
import { updateMemberProfileBodySchema, type AuthenticatedMember } from '@sel/shared';
import { FormField, Icon, Input } from '@sel/ui';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { formatPhoneNumber } from 'src/app/format';
import { CheckboxField, InputField, submitWithMutation } from 'src/components/fields';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import {
  ProfileInfoVisibility,
  ProfileSection,
  ProfileSectionForm,
  useSectionEditing,
  useUpdateProfileMutation,
} from './profile-section';

export function ContactSection({ member }: { member: AuthenticatedMember }) {
  const section = useSectionEditing();
  const title = <Trans>Contact</Trans>;

  if (section.editing) {
    return <ContactForm title={title} member={member} onClose={section.close} />;
  }

  return (
    <ProfileSection title={title} onEdit={section.edit} focusEdit={section.focusEdit}>
      <ul className="stack gap-4">
        <ContactItem icon="email" value={member.email} visible={member.emailVisible} />
        <ContactItem
          icon="phone"
          value={member.phoneNumber === undefined ? undefined : formatPhoneNumber(member.phoneNumber)}
          empty={<Trans>No phone number</Trans>}
          visible={member.phoneNumberVisible}
        />
      </ul>
    </ProfileSection>
  );
}

type ContactItemProps = {
  icon: 'email' | 'phone';
  value?: string;
  empty?: React.ReactNode;
  visible: boolean;
};

function ContactItem({ icon, value, empty, visible }: ContactItemProps) {
  return (
    <li className="row items-start gap-3">
      <Icon name={icon} className="mt-0.5 text-subtle" />

      <div className="stack min-w-0">
        {value === undefined && <span className="text-muted">{empty}</span>}
        {value !== undefined && (
          <>
            <span className="wrap-break-word">{value}</span>
            <ProfileInfoVisibility visible={visible} />
          </>
        )}
      </div>
    </li>
  );
}

type ContactFormProps = {
  title: React.ReactNode;
  member: AuthenticatedMember;
  onClose: () => void;
};

function ContactForm({ title, member, onClose }: ContactFormProps) {
  const form = useForm({
    resolver: useZodResolver(useSchema()),
    defaultValues: {
      emailVisible: member.emailVisible,
      phoneNumberVisible: member.phoneNumberVisible,
      phoneNumber: member.phoneNumber === undefined ? '' : formatPhoneNumber(member.phoneNumber),
    },
  });

  const mutation = useUpdateProfileMutation({
    onSuccess: onClose,
    onError: useFormApiError(form),
  });

  return (
    <ProfileSectionForm
      formState={form.formState}
      title={title}
      onCancel={onClose}
      onSubmit={submitWithMutation(form, mutation)}
    >
      <div className="stack gap-3">
        <FormField
          label={<Trans>Email address</Trans>}
          hint={<Trans>To change it, contact an administrator.</Trans>}
        >
          <Input type="email" value={member.email} readOnly autoFocus />
        </FormField>

        <CheckboxField
          control={form.control}
          name="emailVisible"
          label={<Trans>Show my email address to the other members</Trans>}
        />
      </div>

      <div className="stack gap-3">
        <InputField
          control={form.control}
          name="phoneNumber"
          label={<Trans>Phone number</Trans>}
          type="tel"
          autoComplete="tel"
        />

        <CheckboxField
          control={form.control}
          name="phoneNumberVisible"
          label={<Trans>Show my phone number to the other members</Trans>}
        />
      </div>
    </ProfileSectionForm>
  );
}

function useSchema() {
  const { t } = useLingui();

  return updateMemberProfileBodySchema
    .pick({
      emailVisible: true,
      phoneNumberVisible: true,
    })
    .extend({
      phoneNumber: z
        .string()
        .transform(normalizePhoneNumber)
        .optional()
        .superRefine((value = '', ctx) => {
          if (value === '') {
            ctx.addIssue({ code: 'custom', message: t`Your phone number cannot be removed, only changed` });
          } else if (!/^0\d{9}$/.test(value)) {
            ctx.addIssue({ code: 'custom', message: t`Enter a phone number such as 06 12 34 56 78` });
          }
        }),
    });
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[\s.-]/g, '').replace(/^\+33/, '0');
}
