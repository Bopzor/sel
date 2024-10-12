import { Event } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { pencil } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { breadcrumb, Breadcrumb } from '../../../components/breadcrumb';
import { LinkButton } from '../../../components/button';
import { MemberCard } from '../../../components/member-card';
import { RichText } from '../../../components/rich-text';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';
import { getAuthenticatedMember } from '../../../utils/authenticated-member';
import { matchBreakpoint } from '../../../utils/match-breakpoint';
import { fetchEvent } from '../events.api';

import { EventComments } from './sections/event-comments';
import { EventDate } from './sections/event-date';
import { EventLocation } from './sections/event-location';
import { EventParticipants } from './sections/event-participants';
import { EventParticipation } from './sections/event-participation';

const T = Translate.prefix('events.details');

export default function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = fetchEvent(eventId);

  return (
    // todo: not found
    <Show when={eventQuery.data} fallback="Event not found">
      {(event) => (
        <>
          <Breadcrumb items={[breadcrumb.events(), breadcrumb.event(event())]} />
          <EventDetails event={event()} refetch={() => void eventQuery.refetch()} />
        </>
      )}
    </Show>
  );
}

function EventDetails(props: { event: Event; refetch: () => void }) {
  const isDesktop = matchBreakpoint(1024);
  const isMobile = () => !isDesktop();

  return (
    <>
      <div class="col lg:row gap-6">
        <div class="flex-2 col gap-6 lg:order-2">
          <Header event={props.event} />

          <Message event={props.event} />

          <Show when={isMobile()}>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
              <EventDate event={props.event} />
              <EventLocation event={props.event} />
            </div>
          </Show>

          <EventParticipation event={props.event} onParticipationChanged={props.refetch} />

          <EventComments event={props.event} onCreated={props.refetch} />
        </div>

        <div class="col flex-1 gap-4">
          <Show when={!isMobile()}>
            <EventDate event={props.event} />
            <EventLocation event={props.event} />
            <hr />
          </Show>

          <div>
            <h2 class="mb-4">
              <T id="organizerTitle" />
            </h2>
            <MemberCard inline member={props.event.organizer} />
          </div>

          <EventParticipants event={props.event} />
        </div>
      </div>
    </>
  );
}

function Header(props: { event: Event }) {
  const authenticatedMember = getAuthenticatedMember();

  const isOrganizer = () => {
    return authenticatedMember()?.id === props.event.organizer.id;
  };

  return (
    <div class="sm:row col items-start justify-between gap-4">
      <h1>{props.event.title}</h1>

      <Show when={isOrganizer()}>
        <EditButton event={props.event} />
      </Show>
    </div>
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
