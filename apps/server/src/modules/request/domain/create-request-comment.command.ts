import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestCommentCreatedEvent } from '../request.entities';

export type CreateRequestCommentCommand = {
  commentId: string;
  requestId: string;
  authorId: string;
  body: string;
};

export async function createRequestComment(command: CreateRequestCommentCommand): Promise<void> {
  const { commentId, requestId, authorId, body } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.comments).values({
    id: commentId,
    requestId,
    authorId,
    messageId: await insertMessage(body),
    date: now,
  });

  events.publish(new RequestCommentCreatedEvent(requestId, { commentId, authorId }));
}
