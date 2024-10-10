import path from 'node:path';

import { assert } from '@sel/utils';
import { drizzle, migrate } from 'drizzle-orm/connect';
import pg from 'pg';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import drizzleConfig from '../../drizzle.config';

import * as schema from './schema';

const config = container.resolve(TOKENS.config);
const logger = container.resolve(TOKENS.logger);

export const db = await drizzle('node-postgres', {
  connection: databaseUrl(),
  schema,
  logger: {
    logQuery(query, params) {
      if (config.database.debug) {
        logger.log(query, params);
      }
    },
  },
});

function databaseUrl() {
  const config = container.resolve(TOKENS.config);

  if (import.meta.env.MODE === 'test') {
    return 'postgres://postgres@localhost:5432/test';
  }

  return config.database.url;
}

export async function resetDatabase() {
  assert(import.meta.env.MODE === 'test');

  const client = new pg.Client('postgres://postgres@localhost:5432/postgres');

  await client.connect();
  await client.query('drop database if exists test');
  await client.query('create database test');
  await client.end();

  const base = path.resolve(__dirname, '..', '..');
  const out = drizzleConfig.out as string;

  await migrate(db, {
    migrationsFolder: path.join(base, out),
  });
}

export async function clearDatabase() {
  assert(import.meta.env.MODE === 'test');

  await db.delete(schema.membersInterests);
  await db.delete(schema.interests);
  await db.delete(schema.transactions);
  await db.delete(schema.domainEvents);
  await db.delete(schema.memberDevices);
  await db.delete(schema.notificationDeliveries);
  await db.delete(schema.notifications);
  await db.delete(schema.tokens);
  await db.delete(schema.members);
}