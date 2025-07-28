import { assert } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Message } from 'src/modules/messages/message.entities';
import { db, schema } from 'src/persistence';

import { Member } from '../../member';
import { GetNotificationContext, notify } from '../../notification';
import { Request, RequestCreatedEvent } from '../request.entities';

export async function notifyRequestCreated(event: RequestCreatedEvent) {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, event.entityId),
    with: {
      requester: true,
      message: true,
    },
  });

  assert(request !== undefined);

  await notify(null, 'RequestCreated', (member) => getContext(member, request));
}

function getContext(
  member: Member,
  request: Request & { requester: Member; message: Message },
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
        html: request.message.html,
        text: request.message.text,
      },
    },
  };
}
