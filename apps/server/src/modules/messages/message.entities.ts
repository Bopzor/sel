import { type schema } from 'src/persistence';

import { File } from '../file/file.entity';

export type Message = typeof schema.messages.$inferSelect;
export type MessageInsert = typeof schema.messages.$inferInsert;

export type Attachement = typeof schema.attachements.$inferSelect;

export const withAttachements = { with: { attachements: { with: { file: true as const } } } };
export type MessageWithAttachements = Message & { attachements: Array<Attachement & { file: File }> };
