import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export function preloadEventList() {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('listEvents', {}));
}

export function preloadEvent({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  const eventId = params.eventId!;

  void queryClient.prefetchQuery(apiQuery('getEvent', { path: { eventId } }));

  void queryClient.prefetchQuery(
    apiQuery('getComments', { query: { entityType: 'event', entityId: eventId } }),
  );
}
