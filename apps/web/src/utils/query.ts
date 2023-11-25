import { QueryKey, createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';

import { FetchResult, FetcherPort } from '../fetcher';
import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

type QueryOptions<T> = {
  key: QueryKey;
  query: () => Promise<T>;
  onFetchError?: (error: FetchResult<unknown>) => T;
};

type QueryMeta = {
  isPending: boolean;
  isFetched: boolean;
};

type QueryResult<T> = [data: Accessor<T>, QueryMeta];

export function query<T>(options: (fetcher: FetcherPort) => QueryOptions<T>): QueryResult<T> {
  const fetcher = container.resolve(TOKENS.fetcher);

  const query = createQuery(() => {
    const { key, query, onFetchError } = options(fetcher);

    return {
      suspense: true,
      queryKey: key,
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

  return [() => query.data as T, query];
}
