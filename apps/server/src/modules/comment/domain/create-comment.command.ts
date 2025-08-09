import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { CommentCreatedEvent, CommentEntityType } from '../comment.entities';

export type CreateCommentCommand = {
  commentId: string;
  authorId: string;
  body: string;
  fileIds: string[];
  type: CommentEntityType;
  entityId: string;
};

export async function createComment(command: CreateCommentCommand): Promise<void> {
  const { commentId, authorId, body, fileIds, type, entityId } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  const entityTypeToName = {
    request: 'requestId',
    information: 'informationId',
    event: 'eventId',
  }[type];

  await db.insert(schema.comments).values({
    id: commentId,
    authorId,
    messageId: await insertMessage(body, fileIds),
    date: now,
    [entityTypeToName]: entityId,
  });

  events.publish(
    new CommentCreatedEvent(commentId, { entityType: type, entityId, commentAuthorId: authorId }),
  );
}
