import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { updateMessage } from 'src/modules/messages/message.persistence';
import { TOKENS } from 'src/tokens';

import { InformationUpdatedEvent } from '../information.entities';
import {
  findInformationById,
  updateInformation as updateDatabaseInformation,
} from '../information.persistence';

export type UpdateInformationCommand = {
  informationId: string;
  title?: string;
  body?: string;
  fileIds: string[];
};

export async function updateInformation(command: UpdateInformationCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const information = defined(await findInformationById(command.informationId));

  await updateDatabaseInformation(command.informationId, { title: command.title });

  if (command.body) {
    await updateMessage(information.messageId, command.body, command.fileIds);
  }

  events.publish(new InformationUpdatedEvent(command.informationId));
}
