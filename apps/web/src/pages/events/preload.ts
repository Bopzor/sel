import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export function preloadEventList() {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('listEvents', {}));
}

export function preloadEvent({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('getEvent', { path: { eventId: params.eventId! } }));
}
