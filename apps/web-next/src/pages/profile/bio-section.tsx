import { Trans } from '@lingui/react/macro';
import { updateMemberProfileBodySchema, type AuthenticatedMember } from '@sel/shared';
import { useForm } from 'react-hook-form';

import { submitWithMutation, TextAreaField } from 'src/components/fields';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import {
  ProfileSection,
  ProfileSectionForm,
  useSectionEditing,
  useUpdateProfileMutation,
} from './profile-section';

export function BioSection({ member }: { member: AuthenticatedMember }) {
  const section = useSectionEditing();
  const title = <Trans>About me</Trans>;

  if (section.editing) {
    return <BioForm title={title} member={member} onClose={section.close} />;
  }

  return (
    <ProfileSection title={title} onEdit={section.edit} focusEdit={section.returnFocus}>
      {member.bio ? (
        <p className="wrap-break-word whitespace-pre-line">{member.bio}</p>
      ) : (
        <p className="text-muted">
          <Trans>You have not written anything about yourself yet.</Trans>
        </p>
      )}
    </ProfileSection>
  );
}

const schema = updateMemberProfileBodySchema.pick({
  bio: true,
});

type BioFormProps = {
  title: React.ReactNode;
  member: AuthenticatedMember;
  onClose: () => void;
};

function BioForm({ title, member, onClose }: BioFormProps) {
  const form = useForm({
    resolver: useZodResolver(schema),
    defaultValues: { bio: member.bio ?? '' },
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
      <TextAreaField
        control={form.control}
        name="bio"
        label={<Trans>Presentation</Trans>}
        hint={<Trans>Your activities, what you like to share or to learn</Trans>}
        rows={6}
        autoFocus
      />
    </ProfileSectionForm>
  );
}
