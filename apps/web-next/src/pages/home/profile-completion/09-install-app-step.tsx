import { Trans } from '@lingui/react/macro';
import { Button } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';

import { canPromptInstall, isIPhone, promptInstall } from 'src/app/install-app';

import { CompleteProfileStepButton, StepLayout, useCompleteProfileStep } from './step-layout';

export function InstallAppStep() {
  const { mutate: completeStep } = useCompleteProfileStep();

  const install = useMutation({
    mutationFn: promptInstall,
    onSuccess: (accepted) => accepted && completeStep('installApp'),
  });

  const prompt = canPromptInstall() || install.isPending;

  return (
    <StepLayout
      title={<Trans>Install the app on your phone</Trans>}
      description={<Trans>Open it from your home screen, like any other app.</Trans>}
      actions={
        <>
          {prompt && (
            <Button size="sm" loading={install.isPending} onClick={() => install.mutate()}>
              <Trans>Install</Trans>
            </Button>
          )}

          <CompleteProfileStepButton step="installApp" variant="ghost">
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    >
      {!prompt && (
        <p className="text-body-sm text-muted">
          {isIPhone() ? (
            <Trans>In Safari, tap the share button, then “Add to Home Screen”.</Trans>
          ) : (
            <Trans>In the menu of your browser, choose “Install the app” or “Add to Home Screen”.</Trans>
          )}
        </p>
      )}
    </StepLayout>
  );
}
