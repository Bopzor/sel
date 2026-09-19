import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/persistence/schema/index.ts',
  dialect: 'postgresql',
  // v1 manages every schema by default, restore the previous behavior
  schemaFilter: ['public'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
