import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

import { CompleteProfileStepButton, StepLayout } from './step-layout';

export function AddressStep() {
  return (
    <StepLayout
      title={<Trans>Your address</Trans>}
      actions={
        <>
          <LinkButton Link={Link} href={routes.profile()} state={{ edit: 'address' }} size="sm">
            <Trans>Add</Trans>
          </LinkButton>

          <CompleteProfileStepButton step="address" variant="ghost">
            <Trans>Skip</Trans>
          </CompleteProfileStepButton>
        </>
      }
    >
      <p className="text-muted">
        <Trans>You haven't entered your address yet.</Trans>
      </p>
    </StepLayout>
  );
}
