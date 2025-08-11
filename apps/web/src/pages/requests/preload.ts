import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export function preloadRequestList() {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('listRequests', {}));
}

export function preloadRequest({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  const requestId = params.requestId!;

  void queryClient.prefetchQuery(apiQuery('getRequest', { path: { requestId } }));

  void queryClient.prefetchQuery(
    apiQuery('getComments', { query: { entityType: 'request', entityId: requestId } }),
  );
}
