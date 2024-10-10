import { container } from 'src/infrastructure/container';
import { events } from 'src/infrastructure/events';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestCommentCreatedEvent } from './request.entities';

export type CreateRequestCommentCommand = {
  commentId: string;
  requestId: string;
  authorId: string;
  body: string;
};

export async function createRequestComment(command: CreateRequestCommentCommand): Promise<void> {
  const { commentId, requestId, authorId, body } = command;

  const now = container.resolve(TOKENS.date).now();
  const htmlParser = container.resolve(TOKENS.htmlParser);

  await db.insert(schema.comments).values({
    id: commentId,
    requestId,
    authorId,
    date: now,
    html: body,
    text: htmlParser.getTextContent(body),
  });

  events.emit(new RequestCommentCreatedEvent(requestId, commentId, authorId));
}
