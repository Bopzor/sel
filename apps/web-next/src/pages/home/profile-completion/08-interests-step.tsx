import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

import { CompleteProfileStepButton, StepLayout } from './step-layout';

export function InterestsStep() {
  return (
    <StepLayout
      title={<Trans>Share your interests</Trans>}
      description={<Trans>Find the members who share your passions, and what they can offer.</Trans>}
      actions={
        <>
          <LinkButton Link={Link} href={routes.interests()} size="sm">
            <Trans>See the interests</Trans>
          </LinkButton>

          <CompleteProfileStepButton step="interests" variant="ghost">
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    />
  );
}
