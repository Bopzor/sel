import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export async function preloadInformation({ params }: { params: Params }) {
  const queryClient = useQueryClient();

  await queryClient.prefetchQuery(
    apiQuery('getInformation', { path: { informationId: params.informationId! } }),
  );
}
