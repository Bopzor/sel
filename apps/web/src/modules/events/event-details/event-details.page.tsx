import { Event } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';

import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { MemberCard } from '../../../components/member-card';
import { RichText } from '../../../components/rich-text';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';

import { EventComments } from './sections/event-comments';
import { EventDate } from './sections/event-date';
import { EventLocation } from './sections/event-location';

const T = Translate.prefix('events');

export default function EventDetailsPage() {
  const eventApi = container.resolve(TOKENS.eventApi);
  const { eventId } = useParams<{ eventId: string }>();

  const [event, { refetch }] = createResource(eventId, async (eventId) => {
    return eventApi.getEvent(eventId);
  });

  return (
    <>
      <Breadcrumb items={[breadcrumb.events(), event.latest && breadcrumb.event(event.latest)]} />

      <Show when={event.latest}>
        {(event) => <EventDetails event={event()} refetch={() => void refetch()} />}
      </Show>
    </>
  );
}

function EventDetails(props: { event: Event; refetch: () => void }) {
  return (
    <>
      <div class="mb-6">
        <h1>{props.event.title}</h1>
      </div>

      <div class="col lg:row gap-6">
        <div class="col flex-1 gap-4">
          <EventDate event={props.event} />

          <EventLocation event={props.event} />

          <hr />

          <div>
            <h2 class="mb-4">
              <T id="organizerTitle" />
            </h2>
            <MemberCard inline member={props.event.organizer} />
          </div>
        </div>

        <div class="flex-2 col gap-6">
          <Message event={props.event} />

          <hr />

          <EventComments event={props.event} onCreated={props.refetch} />
        </div>
      </div>
    </>
  );
}

function Message(props: { event: Event }) {
  return <RichText class="card p-4 sm:p-8">{props.event.body}</RichText>;
}
