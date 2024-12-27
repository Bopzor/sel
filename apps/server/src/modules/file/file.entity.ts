import { files } from 'src/persistence/schema';

export type File = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;
