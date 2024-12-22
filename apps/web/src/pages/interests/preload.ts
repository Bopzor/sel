import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export async function preloadInterestList() {
  const queryClient = useQueryClient();
  await queryClient.prefetchQuery(apiQuery('listInterests', {}));
}
