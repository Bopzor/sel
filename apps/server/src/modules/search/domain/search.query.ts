import { awaitProperties, defined, hasProperty } from '@sel/utils';
// cspell:word ilike
import { countDistinct, desc, ilike, inArray, max, or } from 'drizzle-orm';

import { db } from 'src/persistence';
import * as schema from 'src/persistence/schema';

import { withAvatar } from '../../member/member.entities';

const SEARCH_RESULT_LIMIT = 10;

type SearchQuery = {
  search: string;
  page?: number;
};

export async function searchQuery({ search, page = 1 }: SearchQuery) {
  const filterQuery = or(
    ilike(schema.searchView.title, `%${search}%`),
    ilike(schema.searchView.text, `%${search}%`),
  );

  const matchingResources = await db
    .select({
      id: schema.searchView.id,
      resourceType: schema.searchView.type,
    })
    .from(schema.searchView)
    .where(filterQuery)
    .groupBy(schema.searchView.id, schema.searchView.type)
    .orderBy(desc(max(schema.searchView.createdAt)))
    .limit(SEARCH_RESULT_LIMIT)
    .offset(SEARCH_RESULT_LIMIT * (page - 1));

  const countMatchingResources = await db
    .select({
      count: countDistinct(schema.searchView.id),
      resourceType: schema.searchView.type,
    })
    .from(schema.searchView)
    .where(filterQuery)
    .groupBy(schema.searchView.type);

  const requests = matchingResources.filter(({ resourceType }) => resourceType === 'request');
  const events = matchingResources.filter(({ resourceType }) => resourceType === 'event');
  const information = matchingResources.filter(({ resourceType }) => resourceType === 'information');
  const members = matchingResources.filter(({ resourceType }) => resourceType === 'member');

  const resources = await awaitProperties({
    requests:
      requests.length > 0
        ? db.query.requests.findMany({
            where: inArray(
              schema.requests.id,
              requests.map(({ id }) => id),
            ),
            with: { requester: withAvatar },
          })
        : [],
    events:
      events.length > 0
        ? db.query.events.findMany({
            where: inArray(
              schema.events.id,
              events.map(({ id }) => id),
            ),
            with: { organizer: withAvatar },
          })
        : [],
    information:
      information.length > 0
        ? db.query.information.findMany({
            where: inArray(
              schema.information.id,
              information.map(({ id }) => id),
            ),
            with: { author: withAvatar },
          })
        : [],
    members:
      members.length > 0
        ? db.query.members.findMany({
            where: inArray(
              schema.members.id,
              members.map(({ id }) => id),
            ),
            ...withAvatar,
          })
        : [],
  });

  return {
    requests: {
      items:
        requests.length > 0
          ? requests.map(({ id }) => defined(resources.requests.find(hasProperty('id', id))))
          : undefined,
      total: countMatchingResources.find(hasProperty('resourceType', 'request'))?.count ?? 0,
    },
    events: {
      items:
        events.length > 0
          ? events.map(({ id }) => defined(resources.events.find(hasProperty('id', id))))
          : undefined,
      total: countMatchingResources.find(hasProperty('resourceType', 'event'))?.count ?? 0,
    },
    information: {
      items:
        information.length > 0
          ? information.map(({ id }) => defined(resources.information.find(hasProperty('id', id))))
          : undefined,
      total: countMatchingResources.find(hasProperty('resourceType', 'information'))?.count ?? 0,
    },
    members: {
      items:
        members.length > 0
          ? members.map(({ id }) => defined(resources.members.find(hasProperty('id', id))))
          : undefined,
      total: countMatchingResources.find(hasProperty('resourceType', 'member'))?.count ?? 0,
    },
  };
}
