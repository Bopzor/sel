import { createQuery } from '@tanstack/solid-query';

import { catchNotFound } from '../../infrastructure/api';
import { container } from '../../infrastructure/container';
import { TOKENS } from '../../tokens';

export function fetchEvent(eventId: string) {
  const api = container.resolve(TOKENS.api);

  return createQuery(() => ({
    queryKey: ['getEvent', eventId],
    async queryFn() {
      return api.getEvent({ path: { eventId } }).catch(catchNotFound);
    },
  }));
}
