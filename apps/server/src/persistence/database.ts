import { AsyncLocalStorage } from 'node:async_hooks';
import path from 'node:path';
import url from 'node:url';

import { assert, noop } from '@sel/utils';
import { injectableClass } from 'ditox';
import { sql } from 'drizzle-orm';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { ConfigPort } from '../infrastructure/config/config.port';
import { TOKENS } from '../tokens';

import * as schema from './schema';

const { comments, members, requests, tokens, subscriptions, notifications } = schema;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type DB = PostgresJsDatabase<typeof schema>;

export type Transaction = Parameters<Parameters<DB['transaction']>[0]>[0];

export class Database {
  static inject = injectableClass(this, TOKENS.config);

  static migrationsFolder = path.resolve(__dirname, 'migrations');

  public readonly pgQueryClient: postgres.Sql;
  public readonly db: DB;
  private readonly transactionLocalStorage = new AsyncLocalStorage<Transaction>();

  constructor(private readonly config: ConfigPort) {
    // cspell:word onnotice
    this.pgQueryClient = postgres(this.databaseUrl, { onnotice: noop });
    this.db = drizzle(this.pgQueryClient, { schema });
  }

  private get databaseUrl() {
    return this.config.database.url;
  }

  get transaction() {
    return this.transactionLocalStorage.getStore() ?? this.db;
  }

  createTransaction(cb: () => void): void {
    void this.db.transaction(async (tx: Transaction) => {
      return this.transactionLocalStorage.run(tx, cb);
    });
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
    assert(this.databaseUrl.endsWith('/test'), 'Not using test database');

    await this.db.delete(notifications);
    await this.db.delete(subscriptions);
    await this.db.delete(comments);
    await this.db.delete(requests);
    await this.db.delete(tokens);
    await this.db.delete(members);
  }

  async ensureTestDatabase() {
    const client = postgres(this.databaseUrl.replace('/test', '/postgres'));
    const db = drizzle(client);

    // cspell:word datname
    const result = await db.execute(sql`select count(datname) from pg_database where datname = 'test'`);

    if (result[0].count === '0') {
      await db.execute(sql`CREATE DATABASE test`);
    }
  }
}
