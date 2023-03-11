import path from 'node:path';
import url from 'node:url';

import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import '../env';

import { SqlMemberEntity } from '../../modules/members/api/entities/sql-member.entity';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig<PostgreSqlDriver>({
  metadataProvider: TsMorphMetadataProvider,
  type: 'postgresql',
  entities: [SqlMemberEntity],
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  cache: { enabled: false },
  migrations: {
    path: path.resolve(__dirname, 'migrations'),
  },
});
