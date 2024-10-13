import { createQuery } from '@tanstack/solid-query';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

export function getLetsConfig() {
  const api = container.resolve(TOKENS.api);

  const query = createQuery(() => ({
    queryKey: ['getConfig'],
    queryFn: () => api.getConfig({}),
    staleTime: Infinity,
  }));

  return () => query.data;
}
