import { drizzle } from 'drizzle-orm/connect';

export const db = await drizzle('node-postgres', process.env.DATABASE_URL!);
