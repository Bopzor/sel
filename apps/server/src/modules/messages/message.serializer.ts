import { Message } from '@sel/shared';

import { MessageWithAttachments } from './message.entities';

export function serializeMessage(message: MessageWithAttachments): Message {
  return {
    body: message.html,
    attachments: message.attachments.map(({ file }) => ({
      fileId: file.id,
      name: file.name,
      originalName: file.originalName,
      mimetype: file.mimetype,
    })),
  };
}
