import { AuthenticatedMember } from '@sel/shared';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/solid-query';

import { ApiError } from './api';
import { notify } from './notify';
import { setSentryUserId } from './sentry';

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

  queryCache: new QueryCache({
    onSuccess(data, query) {
      if (query.queryKey[0] === 'getAuthenticatedMember') {
        setSentryUserId((data as AuthenticatedMember).id);
      }
    },
  }),

  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      if (mutation.options.onError === undefined) {
        reportError(error);
        notify.error(error);
      }
    },
  }),
});
