import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

import { CompleteProfileStepButton, StepLayout, useCompleteProfileStep } from './step-layout';

export function HelpStep() {
  const { mutate: completeStep } = useCompleteProfileStep();

  return (
    <StepLayout
      title={<Trans>Learn how the app works</Trans>}
      description={<Trans>The help answers the most frequent questions about the LETS and the app.</Trans>}
      actions={
        <>
          <LinkButton Link={Link} href={routes.help()} size="sm" onClick={() => completeStep('help')}>
            <Trans>Read the help</Trans>
          </LinkButton>

          <CompleteProfileStepButton step="help" variant="ghost">
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    />
  );
}
