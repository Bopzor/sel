import { assert } from '@sel/utils';
import dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

const DB_URL = process.env.DB_URL;
assert(typeof DB_URL === 'string');

export default {
  schema: './src/persistence/schema.ts',
  out: './src/persistence/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
} satisfies Config;
