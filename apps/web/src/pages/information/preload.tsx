import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export async function preloadInformation({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  const informationId = params.informationId!;

  void queryClient.prefetchQuery(apiQuery('getInformation', { path: { informationId } }));

  void queryClient.prefetchQuery(
    apiQuery('getComments', { query: { entityType: 'information', entityId: informationId } }),
  );
}
