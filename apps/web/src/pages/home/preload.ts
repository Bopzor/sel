import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export async function preloadHome() {
  const queryClient = useQueryClient();
  await queryClient.prefetchQuery(
    apiQuery('getFeed', {
      query: {
        sortOrder: 'desc',
        page: 1,
      },
    }),
  );
}
