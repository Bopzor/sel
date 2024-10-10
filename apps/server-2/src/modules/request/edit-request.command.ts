import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestEditedEvent } from './request.entities';

export type EditRequestCommand = {
  requestId: string;
  title: string;
  body: string;
};

export async function editRequest(command: EditRequestCommand): Promise<void> {
  const dateAdapter = container.resolve(TOKENS.date);
  const htmlParser = container.resolve(TOKENS.htmlParser);
  const events = container.resolve(TOKENS.events);

  await db
    .update(schema.requests)
    .set({
      title: command.title,
      html: command.body,
      text: htmlParser.getTextContent(command.body),
      updatedAt: dateAdapter.now(),
    })
    .where(eq(schema.requests.id, command.requestId));

  events.publish(new RequestEditedEvent(command.requestId));
}
