import { Trans, useLingui } from '@lingui/react/macro';
import { Card, showToast } from '@sel/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { api } from 'src/app/api';
import { routes } from 'src/app/routes';
import { BackButton } from 'src/components/link';

import { EventForm } from '../event-form';

export function CreateEventPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSuccess = async (eventId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['events'] });
    await navigate(routes.event(eventId));
    showToast(t`Event created`);
  };

  return (
    <div className="stack gap-4">
      <BackButton href={routes.events()}>
        <Trans>Events</Trans>
      </BackButton>

      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Create an event</Trans>
        </h1>
        <p className="text-muted">
          <Trans>Invite the members: they will be notified and can tell whether they are coming.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <EventForm
          mutationFn={(body) => api<string>('POST', '/events', { body })}
          onSuccess={onSuccess}
          submitLabel={<Trans>Create the event</Trans>}
          errorTitle={<Trans>The event could not be created</Trans>}
        />
      </Card.Root>
    </div>
  );
}
