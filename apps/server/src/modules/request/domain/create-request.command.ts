import { RequestStatus } from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestCreatedEvent } from '../request.entities';

export type CreateRequestCommand = {
  requestId: string;
  requesterId: string;
  title: string;
  body: string;
  fileIds: string[];
};

export async function createRequest(command: CreateRequestCommand): Promise<void> {
  const dateAdapter = container.resolve(TOKENS.date);
  const events = container.resolve(TOKENS.events);

  await db.insert(schema.requests).values({
    id: command.requestId,
    requesterId: command.requesterId,
    status: RequestStatus.pending,
    title: command.title,
    messageId: await insertMessage(command.body, command.fileIds),
    date: dateAdapter.now(),
  });

  events.publish(new RequestCreatedEvent(command.requestId, { requesterId: command.requesterId }));
}
