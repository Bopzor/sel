import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InformationCommentCreatedEvent } from '../information.entities';

export type CreateInformationCommentCommand = {
  commentId: string;
  informationId: string;
  authorId: string;
  body: string;
};

export async function createInformationComment(command: CreateInformationCommentCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { commentId, informationId, authorId, body } = command;

  const now = container.resolve(TOKENS.date).now();
  const htmlParser = container.resolve(TOKENS.htmlParser);

  await db.insert(schema.comments).values({
    id: commentId,
    informationId,
    authorId,
    date: now,
    html: body,
    text: htmlParser.getTextContent(body),
  });

  events.publish(new InformationCommentCreatedEvent(informationId, { commentId, authorId }));
}
