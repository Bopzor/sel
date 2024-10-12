import { Config } from '@sel/shared';
import { createQuery } from '@tanstack/solid-query';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

export function getLetsConfig() {
  const fetcher = container.resolve(TOKENS.fetcher);

  const query = createQuery(() => ({
    queryKey: ['getConfig'],
    queryFn: () => fetcher.get<Config>('/config').body(),
    staleTime: Infinity,
  }));

  return () => query.data;
}
