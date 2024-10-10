import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InformationPublished } from '../information.entities';

export type CreateInformationCommand = {
  informationId: string;
  authorId: string;
  body: string;
  isPin: boolean;
};

export async function createInformation(command: CreateInformationCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const htmlParser = container.resolve(TOKENS.htmlParser);
  const events = container.resolve(TOKENS.events);

  await db.insert(schema.information).values({
    id: command.informationId,
    authorId: command.isPin ? undefined : command.authorId,
    html: command.body,
    text: htmlParser.getTextContent(command.body),
    isPin: command.isPin,
    publishedAt: now,
  });

  events.publish(new InformationPublished(command.informationId));
}
