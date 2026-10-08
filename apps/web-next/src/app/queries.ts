import {
  type AuthenticatedMember,
  type Comment,
  type CommentEntityType,
  type Config,
  type DocumentsGroup,
  type Event,
  type EventsListItem,
  type Information,
  type ListEventsQuery,
  type ListInformationQuery,
  type ListRequestsQuery,
  type Member,
  type MembersSort,
  type Request,
  type RequestListItem,
} from '@sel/shared';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  type InfiniteData,
} from '@tanstack/react-query';

import { searchAddresses } from './address-search';
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
      getNextPageParam,
      placeholderData: keepPreviousData,
      select: flattenPages,
    });
  },

  request: (requestId: string) => {
    return queryOptions({
      queryKey: ['request', { id: requestId }],
      queryFn: () => {
        return api<Request>('GET', `/requests/${requestId}`);
      },
    });
  },

  listEvents: (query: Omit<ListEventsQuery, 'year'>) => {
    return infiniteQueryOptions({
      queryKey: ['events', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<EventsListItem>>('GET', '/events', {
          query: { ...query, page: pageParam, pageSize },
          paginated: true,
        });
      },
      initialPageParam: 1,
      getNextPageParam,
      placeholderData: keepPreviousData,
      select: flattenPages,
    });
  },

  event: (eventId: string) => {
    return queryOptions({
      queryKey: ['event', { id: eventId }],
      queryFn: () => {
        return api<Event>('GET', `/events/${eventId}`);
      },
    });
  },

  listInformation: (query: ListInformationQuery) => {
    return infiniteQueryOptions({
      queryKey: ['information-list', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<Information>>('GET', '/information', {
          query: { ...query, page: pageParam, pageSize },
          paginated: true,
        });
      },
      initialPageParam: 1,
      getNextPageParam,
      placeholderData: keepPreviousData,
      select: flattenPages,
    });
  },

  information: (informationId: string) => {
    return queryOptions({
      queryKey: ['information', { id: informationId }],
      queryFn: () => {
        return api<Information>('GET', `/information/${informationId}`);
      },
    });
  },

  listMembers: (query: { sort?: MembersSort } = {}) => {
    return queryOptions({
      queryKey: ['members', query],
      queryFn: () => {
        return api<Member[]>('GET', '/members', { query });
      },
      placeholderData: keepPreviousData,
    });
  },

  member: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId],
      queryFn: () => {
        return api<Member>('GET', `/members/${memberId}`);
      },
    });
  },

  listDocuments: () => {
    return queryOptions({
      queryKey: ['documents'],
      queryFn: () => {
        return api<DocumentsGroup[]>('GET', '/documents');
      },
    });
  },

  searchAddresses: (text: string) => {
    return queryOptions({
      staleTime: 'static',
      queryKey: ['address-search', text],
      queryFn: ({ signal }) => {
        return searchAddresses(text, signal);
      },
    });
  },

  comments: (entityType: CommentEntityType, entityId: string) => {
    return queryOptions({
      queryKey: ['comments', { entityType, entityId }],
      queryFn: () => {
        return api<Comment[]>('GET', '/comment', { query: { entityType, entityId } });
      },
    });
  },
};

function getNextPageParam(lastPage: { total: number }, pages: unknown[]) {
  return pages.length * pageSize < lastPage.total ? pages.length + 1 : undefined;
}

// An item created or deleted between two pages shifts the next ones: an item can come back on the next page.
function flattenPages<T extends { id: string }>(data: InfiniteData<Paginated<T>>): Paginated<T> {
  const items = new Map(data.pages.flatMap((page) => page.items).map((item) => [item.id, item]));

  return {
    total: data.pages.at(-1)?.total ?? 0,
    items: Array.from(items.values()),
  };
}
