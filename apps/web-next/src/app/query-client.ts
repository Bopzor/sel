import { QueryClient } from '@tanstack/react-query';

import { ApiError } from 'src/app/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isClientError(error) && failureCount < 3,
    },
  },
});

function isClientError(error: unknown) {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}
