import { DomainEvent } from 'src/infrastructure/events';
import { type schema } from 'src/persistence';

import { File } from '../file/file.entity';

export type Message = typeof schema.messages.$inferSelect;
export type MessageInsert = typeof schema.messages.$inferInsert;

export type Attachment = typeof schema.attachments.$inferSelect;

export const withAttachments = { with: { attachments: { with: { file: true as const } } } };
export type MessageWithAttachments = Message & { attachments: Array<Attachment & { file: File }> };

export class SetAttachmentsEvent extends DomainEvent<{ filesId: string[] }> {}
