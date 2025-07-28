import { type schema } from 'src/persistence';

export type Message = typeof schema.messages.$inferSelect;
export type MessageInsert = typeof schema.messages.$inferInsert;
