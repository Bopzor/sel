import path from 'node:path';
import url from 'node:url';

import { noop } from '@sel/utils';
import { injectableClass } from 'ditox';
import { sql } from 'drizzle-orm';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { members, tokens } from './schema';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// cspell:word postgres

export class Database {
  static inject = injectableClass(this, TOKENS.config);

  static migrationsFolder = path.resolve(__dirname, 'migrations');

  public readonly pgQueryClient: postgres.Sql;
  public readonly db: PostgresJsDatabase;

  constructor(config: ConfigPort) {
    this.pgQueryClient = postgres(config.database.url, { onnotice: noop });
    this.db = drizzle(this.pgQueryClient);
  }

  async close() {
    await this.pgQueryClient.end({ timeout: 5 });
  }

  async migrate() {
    await migrate(this.db, {
      migrationsFolder: Database.migrationsFolder,
    });
  }

  async reset() {
    await this.db.delete(members);
    await this.db.delete(tokens);
  }

  static async ensureTestDatabase() {
    const client = postgres('postgres://postgres@localhost/postgres');
    const db = drizzle(client);

    // cspell:word datname
    const result = await db.execute(sql`select count(datname) from pg_database where datname = 'test'`);

    if (result[0].count === '0') {
      await db.execute(sql`CREATE DATABASE test`);
    }
  }
}
