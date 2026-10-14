import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

import { CompleteProfileStepButton, StepLayout } from './step-layout';

export function BioStep() {
  return (
    <StepLayout
      title={<Trans>Introduce yourself</Trans>}
      description={<Trans>A few words about you help the other members get to know you.</Trans>}
      actions={
        <>
          <LinkButton Link={Link} href={routes.profile()} state={{ edit: 'bio' }} size="sm">
            <Trans>Write a few words</Trans>
          </LinkButton>

          <CompleteProfileStepButton step="bio" variant="ghost">
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    />
  );
}
