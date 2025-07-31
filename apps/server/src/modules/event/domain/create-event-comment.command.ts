import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { EventCommentCreatedEvent } from '../event.entities';

export type CreateEventCommentCommand = {
  commentId: string;
  eventId: string;
  authorId: string;
  body: string;
  fileIds: string[];
};

export async function createEventComment(command: CreateEventCommentCommand): Promise<void> {
  const { commentId, eventId, authorId, body, fileIds } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.comments).values({
    id: commentId,
    eventId,
    authorId,
    messageId: await insertMessage(body, fileIds),
    date: now,
  });

  events.publish(new EventCommentCreatedEvent(eventId, { commentId, authorId }));
}
