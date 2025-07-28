import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { updateMessage } from 'src/modules/messages/message.persistence';
import { TOKENS } from 'src/tokens';

import { RequestEditedEvent } from '../request.entities';
import { findRequestById, updateRequest } from '../request.persistence';

export type EditRequestCommand = {
  requestId: string;
  title: string;
  body: string;
};

export async function editRequest(command: EditRequestCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const request = defined(await findRequestById(command.requestId));

  await updateRequest(request.id, {
    title: command.title,
  });

  await updateMessage(request.messageId, command.body);

  events.publish(new RequestEditedEvent(command.requestId));
}
