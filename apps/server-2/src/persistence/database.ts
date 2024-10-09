import path from 'node:path';

import { assert } from '@sel/utils';
import { drizzle, migrate } from 'drizzle-orm/connect';
import pg from 'pg';

import { config } from 'src/infrastructure/config';

import drizzleConfig from '../../drizzle.config';

import * as schema from './schema';

export const db = await drizzle('node-postgres', {
  connection: databaseUrl(),
  schema,
});

function databaseUrl() {
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

  await db.delete(schema.transactions);
  await db.delete(schema.members);
}
