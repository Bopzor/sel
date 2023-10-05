import { assert } from '@sel/utils';
import dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

const DB_URL = process.env.DB_URL;
assert(typeof DB_URL === 'string');

export default {
  schema: './src/infrastructure/persistence/schema.ts',
  out: './src/infrastructure/persistence/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: DB_URL,
  },
} satisfies Config;
