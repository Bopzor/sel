import { MutationCache, QueryClient } from '@tanstack/solid-query';

import { ApiError } from './api';
import { notify } from './notify';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      throwOnError: true,
      retry(failureCount: number, error: Error) {
        if (ApiError.is(error) && Math.floor(error.status / 100) === 4) {
          return false;
        }

        return failureCount < 3;
      },
    },
  },
  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      if (mutation.options.onError === undefined) {
        reportError(error);
        notify.error(error);
      }
    },
  }),
});
