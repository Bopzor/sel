import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InformationPublished } from '../information.entities';

export type CreateInformationCommand = {
  informationId: string;
  authorId: string;
  title: string;
  body: string;
};

export async function createInformation(command: CreateInformationCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  await db.insert(schema.information).values({
    id: command.informationId,
    title: command.title,
    authorId: command.authorId,
    messageId: await insertMessage(command.body),
    publishedAt: now,
  });

  events.publish(new InformationPublished(command.informationId));
}
