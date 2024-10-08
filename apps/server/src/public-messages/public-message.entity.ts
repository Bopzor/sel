import { publicMessages } from '../persistence/schema';

export type PublicMessage = typeof publicMessages.$inferSelect;
