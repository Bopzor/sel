import { Trans } from '@lingui/react/macro';
import type { Event } from '@sel/shared';
import { Card, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

import { NotifyDialog } from './notify-dialog';

export function OrganizerActionsCard({ event }: { event: Event }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level={2}>
          <Trans>Your event</Trans>
        </Card.Title>

        <Card.Description>
          <Trans>Keep it up to date, and notify the members of what they need to know.</Trans>
        </Card.Description>
      </Card.Header>

      <Card.Footer>
        <NotifyDialog event={event} />

        <LinkButton
          Link={Link}
          href={routes.editEvent(event.id)}
          variant="secondary"
          icon="edit"
          className="grow"
        >
          <Trans>Edit</Trans>
        </LinkButton>
      </Card.Footer>
    </Card.Root>
  );
}
