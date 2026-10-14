import { useLingui } from '@lingui/react/macro';
import type { ProfileStep, UpdateMemberProfileData } from '@sel/shared';
import { Button, Card, showToast } from '@sel/ui';
import { type Override } from '@sel/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { useSession } from 'src/app/session';

type StepLayoutProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function StepLayout({ title, description, actions, className, children }: StepLayoutProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>{title}</Card.Title>
        {description && <Card.Description>{description}</Card.Description>}
      </Card.Header>
      {children && <Card.Body className={className}>{children}</Card.Body>}
      <Card.Footer className="flex-wrap">{actions}</Card.Footer>
    </Card.Root>
  );
}

type CompleteProfileStepButtonProps = Override<
  React.ComponentProps<typeof Button>,
  {
    step: ProfileStep;
  }
>;

export function CompleteProfileStepButton({ step, ...props }: CompleteProfileStepButtonProps) {
  const { isPending, mutate } = useCompleteProfileStep();

  return <Button size="sm" loading={isPending} onClick={() => mutate(step)} {...props} />;
}

export function useCompleteProfileStep({ reportError = true }: { reportError?: boolean } = {}) {
  const { t } = useLingui();
  const me = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (step: ProfileStep) =>
      api('PUT', `/members/${me.id}/profile`, {
        body: { completedProfileSteps: [step] } satisfies UpdateMemberProfileData,
      }),
    onError: () => {
      if (reportError) {
        showToast(t`Your changes couldn't be saved. Try again in a few moments.`, 'error');
      }
    },
    onSettled: () => queryClient.invalidateQueries(queries.session()),
  });
}

export function useUpdateProfile({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { t } = useLingui();
  const me = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMemberProfileData) => api('PUT', `/members/${me.id}/profile`, { body }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.session());
      onSuccess?.();
    },
    onError: () => showToast(t`Your changes couldn't be saved. Try again in a few moments.`, 'error'),
  });
}
