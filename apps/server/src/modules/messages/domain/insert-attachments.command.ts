import { eq, inArray } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { SetAttachmentsEvent } from '../message.entities';
import { setAttachments as persistSetAttachments } from '../message.persistence';

type SetAttachmentsCommand = {
  messageId: string;
  fileIds: string[];
};

export async function setAttachments(command: SetAttachmentsCommand) {
  const message = await db.query.messages.findFirst({ where: eq(schema.messages.id, command.messageId) });

  if (!message) {
    throw new NotFound('Message not found');
  }

  const files = await db.query.files.findMany({ where: inArray(schema.files.id, command.fileIds) });
  const inexistantFileIds = new Set(command.fileIds).difference(new Set(files.map(({ id }) => id)));

  if (inexistantFileIds.size > 0) {
    throw new NotFound(`Some files don't exist: ${[...inexistantFileIds].join(', ')}`);
  }

  await persistSetAttachments(command.messageId, command.fileIds);

  const events = container.resolve(TOKENS.events);

  events.publish(new SetAttachmentsEvent(command.messageId, { filesId: command.fileIds }));
}
