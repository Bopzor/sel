import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { formatMemberName } from 'src/app/format';
import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';

import { CompleteProfileStepButton, StepLayout } from './step-layout';

export function NameStep() {
  const me = useSession();

  return (
    <StepLayout
      title={<Trans>Is your name correct?</Trans>}
      description={<Trans>This is how the other members see you.</Trans>}
      actions={
        <>
          <CompleteProfileStepButton step="name">
            <Trans>That's it</Trans>
          </CompleteProfileStepButton>

          <LinkButton
            Link={Link}
            href={routes.profile()}
            state={{ edit: 'identity' }}
            variant="ghost"
            size="sm"
          >
            <Trans>Edit</Trans>
          </LinkButton>
        </>
      }
    >
      <p className="row items-center gap-2 text-body-strong">
        <MemberAvatar member={me} decorative />
        {formatMemberName(me)}
      </p>
    </StepLayout>
  );
}
