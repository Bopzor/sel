import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError } from 'src/app/api';
import { captureError } from 'src/app/sentry';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isClientError(error) && failureCount < 3,
    },
  },
});

// Expected errors are filtered out when sent
function onError(error: Error) {
  captureError(error);
}

function isClientError(error: unknown) {
  return ApiError.is(error) && error.status < 500;
}
