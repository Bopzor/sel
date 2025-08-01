import { container } from 'src/infrastructure/container';
import { EventCommentCreatedEvent } from 'src/modules/event/event.entities';
import { InformationCommentCreatedEvent } from 'src/modules/information/information.entities';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { RequestCommentCreatedEvent } from 'src/modules/request/request.entities';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

type CreateCommentEntity = { requestId: string } | { eventId: string } | { informationId: string };

export type CreateCommentCommand = {
  commentId: string;
  authorId: string;
  body: string;
  fileIds: string[];
} & CreateCommentEntity;

export async function createComment(command: CreateCommentCommand): Promise<void> {
  const { commentId, authorId, body, fileIds, ...entityId } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.comments).values({
    id: commentId,
    authorId,
    messageId: await insertMessage(body, fileIds),
    date: now,
    ...entityId,
  });

  const getCommentCreatedEvent = (commentEntity: CreateCommentEntity) => {
    const comment = { commentId, authorId };

    if ('requestId' in commentEntity) {
      return new RequestCommentCreatedEvent(commentEntity.requestId, comment);
    }

    if ('eventId' in commentEntity) {
      return new EventCommentCreatedEvent(commentEntity.eventId, comment);
    }

    if ('informationId' in commentEntity) {
      return new InformationCommentCreatedEvent(commentEntity.informationId, comment);
    }
  };

  const CommentCreatedEvent = getCommentCreatedEvent(entityId);

  if (!CommentCreatedEvent) {
    return;
  }

  events.publish(CommentCreatedEvent);
}
