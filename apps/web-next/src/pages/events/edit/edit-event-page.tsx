import { Trans, useLingui } from '@lingui/react/macro';
import type { Event } from '@sel/shared';
import { Card, EmptyState, LinkButton, showToast, Skeleton } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { api } from 'src/app/api';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { BackButton, Link } from 'src/components/link';

import { EventForm } from '../event-form';
import { EventNotFound } from '../event-not-found';

export function EditEventPage() {
  const eventId = defined(useParams().eventId);
  const query = useQuery(queries.event(eventId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.event(eventId)}>
        <Trans>Back</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<EventNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the event</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<EditEventSkeleton />}
      >
        {(event) => <EditEvent event={event} />}
      </QueryResult>
    </div>
  );
}

function EditEvent({ event }: { event: Event }) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useSuspenseQuery(queries.session());

  if (event.organizer.id !== me.id) {
    return <EventNotEditable event={event} />;
  }

  const onSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['events'] }),
      queryClient.invalidateQueries(queries.event(event.id)),
    ]);

    await navigate(routes.event(event.id));
    showToast(t`Event edited`);
  };

  return (
    <>
      <header className="stack max-w-content gap-1">
        <h1 className="text-title-1">
          <Trans>Edit the event</Trans>
        </h1>
        <p className="text-muted">
          <Trans>The members who are coming or who commented will see the new version.</Trans>
        </p>
      </header>

      <Card.Root className="max-w-content">
        <EventForm
          event={event}
          mutationFn={(body) => api('PUT', `/events/${event.id}`, { body })}
          onSuccess={onSuccess}
          submitLabel={<Trans>Save the changes</Trans>}
          errorTitle={<Trans>Your changes could not be saved</Trans>}
        />
      </Card.Root>
    </>
  );
}

function EventNotEditable({ event }: { event: Event }) {
  return (
    <EmptyState.Root icon="event">
      <EmptyState.Title level={1}>
        <Trans>This event cannot be edited</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Only its organizer can edit an event.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.event(event.id)} variant="secondary">
          <Trans>See the event</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function EditEventSkeleton() {
  return (
    <div aria-busy className="stack gap-4">
      <Skeleton className="h-8 w-1/2" />

      <Card.Root className="max-w-content">
        <Card.Body className="stack gap-6">
          <Skeleton className="h-10" />
          <Skeleton className="h-24" />
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
        </Card.Body>
      </Card.Root>
    </div>
  );
}
