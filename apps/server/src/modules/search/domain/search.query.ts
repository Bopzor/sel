import { awaitProperties } from '@sel/utils';
import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { db } from 'src/persistence';
import { events, information, members, requests, searchView } from 'src/persistence/schema';

import { Event } from '../../event/event.entities';
import { Information } from '../../information/information.entities';
import { MemberWithAvatar, withAvatar } from '../../member/member.entities';
import { Request } from '../../request/request.entities';

const SEARCH_RESULT_LIMIT = 20;

type ResourceType = 'request' | 'event' | 'information' | 'member';

type SearchQuery = {
  search: string;
  page?: number;
  resourceType?: ResourceType;
};

export async function searchQuery({ search, page = 1, resourceType }: SearchQuery) {
  let filterQuery = or(ilike(searchView.title, `%${search}%`), ilike(searchView.text, `%${search}%`));

  if (resourceType) {
    filterQuery = and(
      filterQuery,
      or(eq(searchView.resourceType, resourceType), eq(searchView.parentResourceType, resourceType)),
    );
  }

  const effectiveResourceId = sql<string>`coalesce(${searchView.parentId}, ${searchView.id})`;
  const effectiveResourceType = sql<string>`coalesce(${searchView.parentResourceType}, ${searchView.resourceType})`;

  const matchingResources = await db
    .select({
      id: effectiveResourceId,
      resourceType: effectiveResourceType,
      commentIds: sql<
        string[]
      >`array_agg(${searchView.id}) filter (where ${searchView.resourceType} = 'comment')`,
      commentsOnly: sql<boolean>`NOT(bool_or(${searchView.resourceType} != 'comment'))`,
    })
    .from(searchView)
    .where(filterQuery)
    .groupBy(effectiveResourceId, effectiveResourceType)
    .limit(SEARCH_RESULT_LIMIT)
    .offset(SEARCH_RESULT_LIMIT * (page - 1));

  const countMatchingResources = await db
    .select({
      count: sql`count(distinct coalesce(${searchView.parentId}, ${searchView.id}))`.mapWith(Number),
      resourceType: effectiveResourceType,
    })
    .from(searchView)
    .where(filterQuery)
    .groupBy(effectiveResourceType);

  const matchingResourcesByType = {
    event: matchingResources.filter(({ resourceType }) => resourceType === 'event'),
    request: matchingResources.filter(({ resourceType }) => resourceType === 'request'),
    information: matchingResources.filter(({ resourceType }) => resourceType === 'information'),
    member: matchingResources.filter(({ resourceType }) => resourceType === 'member'),
  } as const;

  const resources = await awaitProperties({
    request:
      matchingResourcesByType.request.length > 0
        ? db.query.requests.findMany({
            where: inArray(
              requests.id,
              matchingResourcesByType.request.map(({ id }) => id),
            ),
            with: { requester: withAvatar },
          })
        : [],
    event:
      matchingResourcesByType.event.length > 0
        ? db.query.events.findMany({
            where: inArray(
              events.id,
              matchingResourcesByType.event.map(({ id }) => id),
            ),
            with: { organizer: withAvatar },
          })
        : [],
    information:
      matchingResourcesByType.information.length > 0
        ? db.query.information.findMany({
            where: inArray(
              information.id,
              matchingResourcesByType.information.map(({ id }) => id),
            ),
            with: { author: withAvatar },
          })
        : [],
    member:
      matchingResourcesByType.member.length > 0
        ? db.query.members.findMany({
            where: inArray(
              members.id,
              matchingResourcesByType.member.map(({ id }) => id),
            ),
            ...withAvatar,
          })
        : [],
  });

  const formatResources = <T>(resourceType: ResourceType) => {
    return {
      items: resources[resourceType].map((item) => {
        const matchingItem = matchingResourcesByType[resourceType].find(({ id }) => item.id === id);

        return {
          item: item as T,
          commentsOnly: matchingItem?.commentsOnly,
          commentIds: matchingItem?.commentIds,
        };
      }),
      total: countMatchingResources.find((item) => item.resourceType === resourceType)?.count,
    };
  };

  return {
    requests: formatResources<Request & { requester: MemberWithAvatar }>('request'),
    events: formatResources<Event & { organizer: MemberWithAvatar }>('event'),
    information: formatResources<Information & { author: MemberWithAvatar | null }>('information'),
    members: formatResources<MemberWithAvatar>('member'),
  };
}
