import { assert } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { db, schema } from 'src/persistence';

import { Member, memberName } from '../../member';
import { GetNotificationContext, notify } from '../../notification';
import { Request, RequestCreatedEvent } from '../request.entities';

export async function notifyRequestCreated(event: RequestCreatedEvent) {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, event.entityId),
    with: {
      requester: true,
    },
  });

  assert(request !== undefined);

  await notify(null, 'RequestCreated', (member) => getContext(member, request));
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
): ReturnType<GetNotificationContext<'RequestCreated'>> {
  if (member.id === request.requester.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    request: {
      id: request.id,
      title: request.title,
      requester: {
        id: request.requester.id,
        name: memberName(request.requester),
      },
      body: {
        html: request.html,
        text: request.text,
      },
    },
  };
}
