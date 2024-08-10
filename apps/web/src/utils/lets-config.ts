import { Config } from '@sel/shared';
import { createResource } from 'solid-js';

export function getLetsConfig() {
  const [data] = createResource(async () => {
    const response = await fetch('/api/config');

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json() as Promise<Config>;
  });

  return data;
}
