import { RequestStatus } from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestCreatedEvent } from './request.entities';

export type CreateRequestCommand = {
  requestId: string;
  requesterId: string;
  title: string;
  body: string;
};

export async function createRequest(command: CreateRequestCommand): Promise<void> {
  const dateAdapter = container.resolve(TOKENS.date);
  const htmlParser = container.resolve(TOKENS.htmlParser);
  const events = container.resolve(TOKENS.events);

  await db.insert(schema.requests).values({
    id: command.requestId,
    requesterId: command.requesterId,
    status: RequestStatus.pending,
    title: command.title,
    date: dateAdapter.now(),
    text: htmlParser.getTextContent(command.body),
    html: command.body,
  });

  events.publish(new RequestCreatedEvent(command.requestId, command.requesterId));
}
