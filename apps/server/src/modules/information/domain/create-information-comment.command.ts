import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InformationCommentCreatedEvent } from '../information.entities';

export type CreateInformationCommentCommand = {
  commentId: string;
  informationId: string;
  authorId: string;
  body: string;
  fileIds: string[];
};

export async function createInformationComment(command: CreateInformationCommentCommand): Promise<void> {
  const { commentId, informationId, authorId, body } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.comments).values({
    id: commentId,
    informationId,
    authorId,
    messageId: await insertMessage(body, command.fileIds),
    date: now,
  });

  events.publish(new InformationCommentCreatedEvent(informationId, { commentId, authorId }));
}
