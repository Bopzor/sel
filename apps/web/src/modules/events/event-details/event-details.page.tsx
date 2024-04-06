import { Event } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { createResource, Show } from 'solid-js';

import { authenticatedMember } from '../../../app-context';
import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { LinkButton } from '../../../components/button';
import { MemberCard } from '../../../components/member-card';
import { RichText } from '../../../components/rich-text';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { TOKENS } from '../../../tokens';

import { EventComments } from './sections/event-comments';
import { EventDate } from './sections/event-date';
import { EventLocation } from './sections/event-location';
import { EventParticipants } from './sections/event-participants';
import { EventParticipation } from './sections/event-participation';

const T = Translate.prefix('events.details');

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
  const isOrganizer = () => {
    return authenticatedMember()?.id === props.event.organizer.id;
  };

  return (
    <>
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

          <EventParticipants event={props.event} />
        </div>

        <div class="flex-2 col gap-6">
          <div class="row justify-between gap-4">
            <h1>{props.event.title}</h1>

            <Show when={isOrganizer()}>
              <EditButton event={props.event} />
            </Show>
          </div>

          <Message event={props.event} />

          <hr />

          <EventParticipation event={props.event} onParticipationChanged={props.refetch} />

          <hr />

          <EventComments event={props.event} onCreated={props.refetch} />
        </div>
      </div>
    </>
  );
}

function EditButton(props: { event: Event }) {
  return (
    <LinkButton variant="secondary" href={routes.events.edit(props.event.id)}>
      <Icon path={pencil} class="size-em text-icon" />
      <T id="editEvent" />
    </LinkButton>
  );
}

function Message(props: { event: Event }) {
  return <RichText class="card p-4 sm:p-8">{props.event.body}</RichText>;
}
