import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export async function preloadInformationList() {
  const queryClient = useQueryClient();
  await queryClient.prefetchQuery(apiQuery('listInformation', {}));
}
