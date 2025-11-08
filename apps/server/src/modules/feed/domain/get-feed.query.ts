import * as shared from '@sel/shared';
import { awaitProperties, defined, hasProperty } from '@sel/utils';
import { and, asc, desc, eq, ilike, inArray, SQL, sql } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db } from 'src/persistence';
import { events, feedView, information, requests, searchView } from 'src/persistence/schema';

type FeedQuery = {
  resourceType?: shared.ResourceType;
  sortOrder: 'desc' | 'asc';
  search?: string;
};

export async function getFeed(query: FeedQuery) {
  const qb = query.search ? db.select().from(searchView) : db.select().from(feedView);

  if (query.search) {
    let where: SQL | undefined = ilike(searchView.text, `%${query.search}%`);

    if (query.resourceType) {
      where = and(where, eq(searchView.type, query.resourceType));
    }

    qb.where(where);
  } else {
    if (query.resourceType) {
      qb.where(eq(feedView.type, query.resourceType));
    }
  }

  if (query.sortOrder === 'asc') {
    qb.orderBy(asc(sql`"created_at"`));
  } else {
    qb.orderBy(desc(sql`"created_at"`));
  }

  const unionResults = await qb.limit(10);

  const eventIds = unionResults.filter(({ type }) => type === 'event').map(({ id }) => id);
  const requestIds = unionResults.filter(({ type }) => type === 'request').map(({ id }) => id);
  const informationIds = unionResults.filter(({ type }) => type === 'information').map(({ id }) => id);

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

  return unionResults.map(({ type, id }) => {
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
  });
}
