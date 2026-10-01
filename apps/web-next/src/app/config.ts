import { useSuspenseQuery } from '@tanstack/react-query';

import { queries } from './queries';
import { queryClient } from './query-client';

export async function loadConfig() {
  return queryClient.query(queries.config());
}

export function useConfig() {
  return useSuspenseQuery(queries.config()).data;
}
