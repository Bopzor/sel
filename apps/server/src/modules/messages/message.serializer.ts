import { Message } from '@sel/shared';

import { MessageWithAttachements } from './message.entities';

export function serializeMessage(message: MessageWithAttachements): Message {
  return {
    body: message.html,
    attachements: message.attachements.map(({ file }) => ({
      fileId: file.id,
      name: file.name,
      originalName: file.originalName,
      mimetype: file.mimetype,
    })),
  };
}
