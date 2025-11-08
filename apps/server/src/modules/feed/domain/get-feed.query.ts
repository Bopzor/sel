import { awaitProperties, defined, hasProperty } from '@sel/utils';
import { desc, inArray, sql } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db } from 'src/persistence';
import { events, feedView, information, requests } from 'src/persistence/schema';

export async function getFeed() {
  const unionResults = await db
    .select()
    .from(feedView)
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
