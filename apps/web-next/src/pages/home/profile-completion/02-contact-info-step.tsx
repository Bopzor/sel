import { Trans } from '@lingui/react/macro';
import { Icon, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { Link } from 'src/components/link';

import { StepLayout } from './step-layout';

export function ContactInfoStep() {
  const me = useSession();

  return (
    <StepLayout
      title={<Trans>Add your phone number</Trans>}
      actions={
        <LinkButton Link={Link} href={routes.profile()} state={{ edit: 'contact' }} size="sm">
          <Trans>Add my phone number</Trans>
        </LinkButton>
      }
    >
      <ul className="stack gap-4">
        <li className="row items-center gap-3">
          <Icon name="email" className="text-subtle" />
          <span className="min-w-0 wrap-break-word">{me.email}</span>
        </li>

        <li className="row items-center gap-3">
          <Icon name="phone" className="text-subtle" />
          <span className="text-muted">
            <Trans>No phone number</Trans>
          </span>
        </li>
      </ul>
    </StepLayout>
  );
}
