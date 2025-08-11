import { useParams } from '@solidjs/router';
import { useQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { Comments } from 'src/components/comments';
import { BoxSkeleton } from 'src/components/skeleton';
import { createMediaQuery } from 'src/utils/media-query';

import { EventDate } from './sections/event-date';
import { EventDescription } from './sections/event-description';
import { EventHeader } from './sections/event-header';
import { EventLocation } from './sections/event-location';
import { EventOrganizer } from './sections/event-organizer';
import { EventParticipantList } from './sections/event-participant-list';
import { EventParticipation } from './sections/event-participation';

export function EventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  const query = useQuery(() => apiQuery('getEvent', { path: { eventId: params.eventId } }));

  const isMobile = createMediaQuery('(max-width: 1024px)');

  return (
    <Show when={query.data} fallback={<Skeleton />}>
      {(event) => (
        <>
          <Show when={isMobile()}>
            <div class="col gap-12">
              <EventHeader event={event()} />
              <EventDescription event={event()} />
              <EventDate event={event()} />
              <EventLocation event={event()} />
              <EventParticipation event={event()} />
              <EventOrganizer event={event()} />
              <EventParticipantList event={event()} />
              <Comments entityType="event" entityId={event().id} />
            </div>
          </Show>

          <Show when={!isMobile()}>
            <div class="grid grid-cols-3 items-start gap-x-8 gap-y-12">
              <div class="col gap-12">
                <EventDate event={event()} />
                <EventLocation event={event()} />
                <EventOrganizer event={event()} />
                <EventParticipantList event={event()} />
              </div>

              <div class="col-span-2 col gap-12">
                <EventHeader event={event()} />
                <EventDescription event={event()} />
                <EventParticipation event={event()} />
                <Comments entityType="event" entityId={event().id} />
              </div>
            </div>
          </Show>
        </>
      )}
    </Show>
  );
}

function Skeleton() {
  return (
    <div class="grid grid-cols-1 items-start gap-x-8 gap-y-12 lg:grid-cols-3">
      <div class="col gap-12 lg:order-2 lg:col-span-2">
        <BoxSkeleton height={4} />
        <BoxSkeleton height={12} />
        <BoxSkeleton height={8} />
        <BoxSkeleton height={16} />
      </div>

      <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
        <div class="col gap-12 lg:gap-4">
          <BoxSkeleton height={6} />
          <BoxSkeleton height={12} />
        </div>

        <div class="col gap-12">
          <BoxSkeleton height={6} />
          <BoxSkeleton height={4} />
        </div>
      </div>
    </div>
  );
}
