import { Trans, useLingui } from '@lingui/react/macro';
import { Button, showToast } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';

import { maxFileSize, uploadFile } from 'src/app/api';
import { useSession } from 'src/app/session';
import { MemberAvatar } from 'src/components/member-avatar';
import { useFileInput } from 'src/hooks/use-file-input';

import { CompleteProfileStepButton, StepLayout, useUpdateProfile } from './step-layout';

export function AvatarStep() {
  const { t } = useLingui();
  const me = useSession();
  const update = useUpdateProfile();

  const upload = useMutation({
    mutationFn: uploadFile,
    onSuccess: ({ name }) => update.mutate({ avatarFileName: name }),
    onError: () => showToast(t`The photo couldn't be sent. Try again in a few moments.`, 'error'),
  });

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

  const loading = upload.isPending || update.isPending;

  return (
    <StepLayout
      title={<Trans>Add a photo</Trans>}
      description={<Trans>It helps the other members recognize you.</Trans>}
      actions={
        <>
          <Button size="sm" loading={loading} onClick={fileInput.open}>
            <Trans>Choose a photo</Trans>
          </Button>

          <CompleteProfileStepButton step="avatar" variant="ghost" disabled={loading}>
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    >
      <div className="row justify-center">
        <MemberAvatar member={me} size="lg" />
      </div>
      {fileInput.input}
    </StepLayout>
  );
}
