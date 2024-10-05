import { Config } from '@sel/shared';
import { createResource } from 'solid-js';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

export function getLetsConfig() {
  const [data] = createResource(async () => {
    return container.resolve(TOKENS.fetcher).get<Config>('/config').body();
  });

  return data;
}
