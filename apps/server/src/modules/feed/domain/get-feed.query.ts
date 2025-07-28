import { awaitProperties, defined, hasProperty } from '@sel/utils';
import { desc, inArray, sql } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachements } from 'src/modules/messages/message.entities';
import { db } from 'src/persistence';
import { events, information, requests } from 'src/persistence/schema';

export async function getFeed() {
  type ResourceType = 'event' | 'information' | 'request';

  const unionResults = await union(
    db
      .select({
        type: sql<ResourceType>`'event'`.as('type'),
        id: events.id,
        createdAt: events.createdAt,
      })
      .from(events),
    db
      .select({
        type: sql<ResourceType>`'information'`.as('type'),
        id: information.id,
        createdAt: information.createdAt,
      })
      .from(information),
    db
      .select({
        type: sql<ResourceType>`'request'`.as('type'),
        id: requests.id,
        createdAt: requests.createdAt,
      })
      .from(requests),
  )
    .orderBy(desc(sql`"created_at"`))
    .limit(10);

  const eventIds = unionResults.filter(({ type }) => type === 'event').map(({ id }) => id);
  const requestIds = unionResults.filter(({ type }) => type === 'request').map(({ id }) => id);
  const informationIds = unionResults.filter(({ type }) => type === 'information').map(({ id }) => id);

  const resources = await awaitProperties({
    events:
      eventIds.length > 0
        ? db.query.events.findMany({
            where: inArray(events.id, eventIds),
            with: { organizer: withAvatar, message: withAttachements },
          })
        : [],
    requests:
      requestIds.length > 0
        ? db.query.requests.findMany({
            where: inArray(requests.id, requestIds),
            with: { requester: withAvatar, message: withAttachements },
          })
        : [],
    informations:
      informationIds.length > 0
        ? db.query.information.findMany({
            where: inArray(information.id, informationIds),
            with: { author: withAvatar, message: withAttachements },
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
