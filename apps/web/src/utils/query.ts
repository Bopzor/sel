import { QueryKey, createQuery } from '@tanstack/solid-query';

import { FetchResult, FetcherPort } from '../fetcher';
import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

type QueryOptions<T> = {
  key: QueryKey;
  query: () => Promise<T>;
  skip?: boolean;
  refetchOnMount?: boolean;
  onFetchError?: (error: FetchResult<unknown>) => T;
};

export type QueryResult<T> = {
  data: T | undefined;
  error: Error | null;
  isPending: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
};

export function query<T>(options: (fetcher: FetcherPort) => QueryOptions<T>): QueryResult<T> {
  const fetcher = container.resolve(TOKENS.fetcher);

  return createQuery(() => {
    const { key, skip, refetchOnMount, query, onFetchError } = options(fetcher);

    return {
      suspense: true,
      queryKey: key,
      enabled: !skip,
      refetchOnMount,
      async queryFn() {
        try {
          return await query();
        } catch (error) {
          if (onFetchError && FetchResult.is(error)) {
            return onFetchError(error);
          }

          throw error;
        }
      },
    };
  });
}
