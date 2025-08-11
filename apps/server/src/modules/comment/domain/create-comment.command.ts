import * as shared from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { CommentCreatedEvent } from '../comment.entities';

export type CreateCommentCommand = {
  commentId: string;
  authorId: string;
  body: string;
  fileIds: string[];
  entityType: shared.CommentEntityType;
  entityId: string;
};

export async function createComment(command: CreateCommentCommand): Promise<void> {
  const { commentId, authorId, body, fileIds, entityType, entityId } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.comments).values({
    id: commentId,
    authorId,
    messageId: await insertMessage(body, fileIds),
    date: now,
    [`${entityType}Id`]: entityId,
  });

  events.publish(
    new CommentCreatedEvent(commentId, { entityType: entityType, entityId, commentAuthorId: authorId }),
  );
}
