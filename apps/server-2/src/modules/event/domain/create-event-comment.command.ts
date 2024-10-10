import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { EventCommentCreatedEvent } from '../event.entities';

export type CreateEventCommentCommand = {
  commentId: string;
  eventId: string;
  authorId: string;
  body: string;
};

export async function createEventComment(command: CreateEventCommentCommand): Promise<void> {
  const { commentId, eventId, authorId, body } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();
  const htmlParser = container.resolve(TOKENS.htmlParser);

  await db.insert(schema.comments).values({
    id: commentId,
    eventId,
    authorId,
    date: now,
    html: body,
    text: htmlParser.getTextContent(body),
  });

  events.publish(new EventCommentCreatedEvent(eventId, { commentId, authorId }));
}
