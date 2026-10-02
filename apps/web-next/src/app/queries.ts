import {
  type AuthenticatedMember,
  type Config,
  type ListRequestsQuery,
  type RequestListItem,
} from '@sel/shared';
import { infiniteQueryOptions, keepPreviousData, queryOptions, type InfiniteData } from '@tanstack/react-query';

import { api } from './api';

type Paginated<T> = { total: number; items: T[] };

const pageSize = 10;

export const queries = {
  config: () => {
    return queryOptions({
      staleTime: 'static',
      queryKey: ['config'],
      queryFn: () => {
        return api<Config>('GET', '/config');
      },
    });
  },

  session: () => {
    return queryOptions({
      queryKey: ['session'],
      queryFn: () => {
        return api<AuthenticatedMember>('GET', '/session/member');
      },
    });
  },

  listRequests: (query: Omit<ListRequestsQuery, 'year'>) => {
    return infiniteQueryOptions({
      queryKey: ['requests', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<RequestListItem>>('GET', '/requests', {
          query: { ...query, page: pageParam, pageSize },
          paginated: true,
        });
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        return pages.length * pageSize < lastPage.total ? pages.length + 1 : undefined;
      },
      placeholderData: keepPreviousData,
      select: flattenPages,
    });
  },
};

// An item created or deleted between two pages shifts the next ones: an item can come back on the next page.
function flattenPages<T extends { id: string }>(data: InfiniteData<Paginated<T>>): Paginated<T> {
  const items = new Map(data.pages.flatMap((page) => page.items).map((item) => [item.id, item]));

  return {
    total: data.pages.at(-1)?.total ?? 0,
    items: Array.from(items.values()),
  };
}
