import { schema } from 'src/persistence';

export type Comment = typeof schema.comments.$inferSelect;
