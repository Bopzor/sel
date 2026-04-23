// cspell:words ilike;

import * as shared from '@sel/shared';
import { awaitProperties, defined, getId, hasProperty } from '@sel/utils';
import { and, asc, desc, eq, ilike, inArray, max, SQL } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db, paginated } from 'src/persistence';
import { events, feedView, information, requests, searchView } from 'src/persistence/schema';

type FeedQuery = {
  resourceType?: shared.ResourceType;
  sortOrder: 'desc' | 'asc';
  search?: string;
  page: number;
  pageSize: number;
};

export async function getFeed(query: FeedQuery) {
  const [total, results] = query.search ? await search(query) : await feed(query);

  const eventIds = results.filter(({ type }) => type === 'event').map(getId);
  const requestIds = results.filter(({ type }) => type === 'request').map(getId);
  const informationIds = results.filter(({ type }) => type === 'information').map(getId);

  const resources = await awaitProperties({
    events:
      eventIds.length > 0
        ? db.query.events.findMany({
            where: inArray(events.id, eventIds),
            with: { organizer: withAvatar, message: withAttachments },
          })
        : [],
    requests:
      requestIds.length > 0
        ? db.query.requests.findMany({
            where: inArray(requests.id, requestIds),
            with: { requester: withAvatar, message: withAttachments },
          })
        : [],
    informations:
      informationIds.length > 0
        ? db.query.information.findMany({
            where: inArray(information.id, informationIds),
            with: { author: withAvatar, message: withAttachments },
          })
        : [],
  });

  return {
    total,
    items: results.map(({ type, id }) => {
      if (type === 'event') {
        return ['event', defined(resources.events.find(hasProperty('id', id)))] as const;
      }

      if (type === 'request') {
        return ['request', defined(resources.requests.find(hasProperty('id', id)))] as const;
      }

      if (type === 'information') {
        return ['information', defined(resources.informations.find(hasProperty('id', id)))] as const;
      }

      return type;
    }),
  };
}

function feed(query: FeedQuery) {
  const conditions: SQL[] = [];
  const order = query.sortOrder === 'asc' ? asc : desc;

  if (query.resourceType) {
    conditions.push(eq(feedView.type, query.resourceType));
  }

  return paginated(
    query,
    db
      .select()
      .from(feedView)
      .where(and(...conditions))
      .orderBy(order(feedView.createdAt))
      .$dynamic(),
  );
}

function search(query: FeedQuery) {
  const conditions: SQL[] = [];
  const order = query.sortOrder === 'asc' ? asc : desc;

  conditions.push(ilike(searchView.text, `%${query.search}%`));

  if (query.resourceType) {
    conditions.push(eq(searchView.type, query.resourceType));
  }

  return paginated(
    query,
    db
      .select({
        id: searchView.id,
        type: searchView.type,
        createdAt: max(searchView.createdAt),
      })
      .from(searchView)
      .where(and(...conditions))
      .groupBy(searchView.id, searchView.type)
      .orderBy(order(max(searchView.createdAt)))
      .$dynamic(),
  );
}
