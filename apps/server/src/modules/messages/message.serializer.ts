import { MessageWithAttachements } from './message.entities';

export function serializeMessage(message: MessageWithAttachements) {
  return {
    body: message.html,
    attachements: message.attachements.map(({ file }) => ({
      name: file.name,
      mimetype: file.mimetype,
    })),
  };
}
