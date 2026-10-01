import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A client error (not found, forbidden…) won't go away by asking again.
      retry: (failureCount, error) => !isClientError(error) && failureCount < 3,
    },
  },
});

function isClientError(error: unknown) {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}
