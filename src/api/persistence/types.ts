import { MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

export type OrmType = MikroORM<PostgreSqlDriver>;
export type EntityManagerType = EntityManager;
