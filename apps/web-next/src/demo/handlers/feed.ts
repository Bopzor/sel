import { feedQuerySchema, type FeedItem } from '@sel/shared';

import { demo } from '../demo';

export const demoFeedRoutes = [
  demo.route('GET', '/feed', ({ state, query }) => {
    const { search, sortOrder, resourceType, page } = feedQuerySchema.parse(query);

    const items: FeedItem[] = [
      ...state.requests.map((request): FeedItem => [
        'request',
        {
          id: request.id,
          status: request.status,
          requester: demo.serializeLightMember(demo.findMember(state, request.requesterId)),
          title: request.title,
          message: request.message,
          publishedAt: request.date,
        },
      ]),
      ...state.events.map((event): FeedItem => [
        'event',
        {
          id: event.id,
          title: event.title,
          message: event.message,
          date: event.date,
          location: event.location,
          organizer: demo.serializeLightMember(demo.findMember(state, event.organizerId)),
          publishedAt: event.createdAt,
        },
      ]),
      ...state.information.map(({ id, title, message, authorId, publishedAt }): FeedItem => [
        'information',
        {
          id,
          title,
          message,
          author:
            authorId === undefined ? undefined : demo.serializeLightMember(demo.findMember(state, authorId)),
          publishedAt,
        },
      ]),
    ];

    const results = items
      .filter(([type]) => resourceType === undefined || type === resourceType)
      .filter(([, { title, message }]) => search === undefined || demo.matchesSearch(search, title, message))
      .toSorted(
        ([, a], [, b]) => a.publishedAt.localeCompare(b.publishedAt) * (sortOrder === 'asc' ? 1 : -1),
      );

    return demo.paginated(results, { page, pageSize: 10 });
  }),
];
