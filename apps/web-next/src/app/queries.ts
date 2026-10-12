import {
  type AuthenticatedMember,
  type Comment,
  type CommentEntityType,
  type Config,
  type DocumentsGroup,
  type Event,
  type EventsListItem,
  type FeedItem,
  type Information,
  type ListEventsQuery,
  type ListInformationQuery,
  type ListMemberActivityQuery,
  type ListMemberTransactionsQuery,
  type ListRequestsQuery,
  type Member,
  type MemberActivityCounts,
  type MemberActivityItem,
  type MembersSort,
  type MemberTransactionStats,
  type Request,
  type RequestListItem,
  type ResourceType,
  type Transaction,
} from '@sel/shared';
import { addDuration } from '@sel/utils';
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
      queryFn: () => api<Config>('GET', '/config'),
    });
  },

  session: () => {
    return queryOptions({
      queryKey: ['session'],
      queryFn: () => api<AuthenticatedMember>('GET', '/session/member'),
    });
  },

  feed: (query: { resourceType?: ResourceType; search?: string }) => {
    return infiniteQueryOptions({
      queryKey: ['feed', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<FeedItem>>('GET', '/feed', {
          query: { ...query, page: pageParam },
          paginated: true,
        });
      },
      initialPageParam: 1,
      getNextPageParam,
      placeholderData: keepPreviousData,
      select: (data): Paginated<FeedItem> => {
        const items = data.pages.flatMap((page) => page.items);
        const unique = new Map(items.map((item) => [item[1].id, item]));

        return { total: data.pages.at(-1)?.total ?? 0, items: Array.from(unique.values()) };
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
      queryFn: () => api<Request>('GET', `/requests/${requestId}`),
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

  upcomingEvents: () => {
    return queryOptions({
      queryKey: ['events', 'upcoming'],
      queryFn: () =>
        api<Paginated<EventsListItem>>('GET', '/events', {
          query: {
            timing: 'upcoming',
            committeeMeeting: 'false',
            before: addDuration(new Date(), { days: 7 }).toISOString(),
            page: 1,
            pageSize: 2,
          },
          paginated: true,
        }),
    });
  },

  nextCommitteeMeeting: () => {
    return queryOptions({
      queryKey: ['events', 'next-committee-meeting'],
      queryFn: () =>
        api<Paginated<EventsListItem>>('GET', '/events', {
          query: { timing: 'upcoming', committeeMeeting: 'true', page: 1, pageSize: 1 },
          paginated: true,
        }),
      select: ({ items }) => items[0] ?? null,
    });
  },

  event: (eventId: string) => {
    return queryOptions({
      queryKey: ['event', { id: eventId }],
      queryFn: () => api<Event>('GET', `/events/${eventId}`),
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
      queryFn: () => api<Information>('GET', `/information/${informationId}`),
    });
  },

  listMembers: (query: { sort?: MembersSort } = {}) => {
    return queryOptions({
      queryKey: ['members', query],
      queryFn: () => api<Member[]>('GET', '/members', { query }),
      placeholderData: keepPreviousData,
    });
  },

  member: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId],
      queryFn: () => api<Member>('GET', `/members/${memberId}`),
    });
  },

  memberTransactionStats: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId, 'transaction-stats'],
      queryFn: () => api<MemberTransactionStats>('GET', `/members/${memberId}/transactions/stats`),
    });
  },

  listMemberTransactions: (
    memberId: string,
    query: Omit<ListMemberTransactionsQuery, 'page' | 'pageSize'>,
  ) => {
    return infiniteQueryOptions({
      queryKey: ['members', memberId, 'transactions', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<Transaction>>('GET', `/members/${memberId}/transactions`, {
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

  latestMemberTransactions: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId, 'latest-transactions'],
      queryFn: () =>
        api<Paginated<Transaction>>('GET', `/members/${memberId}/transactions`, {
          query: { status: 'completed', page: 1, pageSize: 3 },
          paginated: true,
        }),
    });
  },

  memberActivityCounts: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId, 'activity-counts'],
      queryFn: () => api<MemberActivityCounts>('GET', `/members/${memberId}/activity/counts`),
    });
  },

  listMemberActivity: (memberId: string, query: Omit<ListMemberActivityQuery, 'page' | 'pageSize'>) => {
    return infiniteQueryOptions({
      queryKey: ['members', memberId, 'activity', query],
      queryFn: ({ pageParam }) => {
        return api<Paginated<MemberActivityItem>>('GET', `/members/${memberId}/activity`, {
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

  latestMemberActivity: (memberId: string) => {
    return queryOptions({
      queryKey: ['members', memberId, 'latest-activity'],
      queryFn: () =>
        api<Paginated<MemberActivityItem>>('GET', `/members/${memberId}/activity`, {
          query: { page: 1, pageSize: 3 },
          paginated: true,
        }),
    });
  },

  listDocuments: () => {
    return queryOptions({
      queryKey: ['documents'],
      queryFn: () => api<DocumentsGroup[]>('GET', '/documents'),
    });
  },

  searchAddresses: (text: string) => {
    return queryOptions({
      staleTime: 'static',
      queryKey: ['address-search', text],
      queryFn: ({ signal }) => searchAddresses(text, signal),
    });
  },

  comments: (entityType: CommentEntityType, entityId: string) => {
    return queryOptions({
      queryKey: ['comments', { entityType, entityId }],
      queryFn: () => api<Comment[]>('GET', '/comment', { query: { entityType, entityId } }),
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
