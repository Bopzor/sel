import { Trans, useLingui } from '@lingui/react/macro';
import { updateMemberProfileBodySchema, type AuthenticatedMember } from '@sel/shared';
import { Button, showToast } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';

import { maxFileSize, uploadFile } from 'src/app/api';
import { formatMemberName } from 'src/app/format';
import { InputField, submitWithMutation } from 'src/components/fields';
import { MemberAvatar } from 'src/components/member-avatar';
import { useFileInput } from 'src/hooks/use-file-input';
import { useFormApiError } from 'src/hooks/use-form-api-error';
import { useZodResolver } from 'src/hooks/use-zod-resolver';

import {
  ProfileSection,
  ProfileSectionForm,
  useSectionEditing,
  useUpdateProfileMutation,
} from './profile-section';

export function IdentitySection({ member }: { member: AuthenticatedMember }) {
  const section = useSectionEditing();
  const title = <Trans>Name and photo</Trans>;

  if (section.editing) {
    return <IdentityForm title={title} member={member} onClose={section.close} />;
  }

  return (
    <ProfileSection title={title} onEdit={section.edit} focusEdit={section.focusEdit}>
      <div className="row items-center gap-4">
        <MemberAvatar member={member} size="lg" decorative />
        <p className="text-title-3">{formatMemberName(member)}</p>
      </div>
    </ProfileSection>
  );
}

const schema = updateMemberProfileBodySchema.pick({
  firstName: true,
  lastName: true,
  avatarFileName: true,
});

type IdentityFormProps = {
  title: React.ReactNode;
  member: AuthenticatedMember;
  onClose: () => void;
};

function IdentityForm({ title, member, onClose }: IdentityFormProps) {
  const { t } = useLingui();

  const form = useForm({
    resolver: useZodResolver(schema),
    defaultValues: { firstName: member.firstName, lastName: member.lastName, avatarFileName: member.avatar },
  });

  const mutation = useUpdateProfileMutation({
    onSuccess: onClose,
    onError: useFormApiError(form),
  });

  const upload = useMutation({
    mutationFn: uploadFile,
    onSuccess: ({ name }) => form.setValue('avatarFileName', name),
    onError: () => showToast(t`The photo could not be sent. Try again in a few moments.`, 'error'),
  });

  const avatarFileName = useWatch({ control: form.control, name: 'avatarFileName' });

  return (
    <ProfileSectionForm
      formState={form.formState}
      title={title}
      busy={upload.isPending}
      onCancel={onClose}
      onSubmit={submitWithMutation(form, mutation)}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <InputField
          control={form.control}
          name="firstName"
          label={<Trans>First name</Trans>}
          autoComplete="given-name"
          autoFocus
        />
        <InputField
          control={form.control}
          name="lastName"
          label={<Trans>Last name</Trans>}
          autoComplete="family-name"
        />
      </div>

      <AvatarUpload
        member={member}
        avatarFileName={avatarFileName ?? undefined}
        upload={upload}
        onRemove={() => form.setValue('avatarFileName', null)}
      />
    </ProfileSectionForm>
  );
}

function AvatarUpload({
  member,
  avatarFileName,
  upload,
  onRemove,
}: {
  member: AuthenticatedMember;
  avatarFileName?: string;
  upload: { mutate: (file: File) => void; isPending: boolean };
  onRemove: () => void;
}) {
  const { t } = useLingui();

  const fileInput = useFileInput(
    ([file]) => {
      if (file === undefined) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast(t`The photo must be an image`, 'error');
      } else if (file.size > maxFileSize) {
        showToast(t`The photo must be at most 10 MB`, 'error');
      } else {
        upload.mutate(file);
      }
    },
    { multiple: false, accept: 'image/*' },
  );

  return (
    <div className="row items-center gap-4">
      <MemberAvatar member={{ ...member, avatar: avatarFileName }} size="lg" />

      <div className="row flex-wrap gap-2">
        <Button variant="secondary" size="sm" loading={upload.isPending} onClick={fileInput.open}>
          <Trans>Change the photo</Trans>
        </Button>

        {avatarFileName !== undefined && (
          <Button variant="ghost" size="sm" disabled={upload.isPending} onClick={onRemove}>
            <Trans>Remove the photo</Trans>
          </Button>
        )}
      </div>

      {fileInput.input}
    </div>
  );
}
