import { Event } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';

import { BackLink } from '../../components/back-link';
import { container } from '../../infrastructure/container';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

export default function EventDetailsPage() {
  const eventApi = container.resolve(TOKENS.eventApi);
  const { eventId } = useParams<{ eventId: string }>();

  const [event, { refetch }] = createResource(eventId, async (eventId) => {
    return eventApi.getEvent(eventId);
  });

  return (
    <>
      <BackLink href={routes.events.list} />

      <Show when={event.latest}>
        {(event) => <EventDetails event={event()} refetch={() => void refetch()} />}
      </Show>
    </>
  );
}

function EventDetails(props: { event: Event; refetch: () => void }) {
  return <>{props.event.title}</>;
}
