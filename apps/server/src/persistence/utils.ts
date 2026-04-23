import { count, sql } from 'drizzle-orm';
import { PgSelect } from 'drizzle-orm/pg-core';

import { db } from './database';

export async function paginated<Qb extends PgSelect>(query: { page: number; pageSize: number }, qb: Qb) {
  return Promise.all([
    db
      .select({ count: count() })
      .from(sql`(${qb.getSQL()})`)
      .then(([{ count }]) => count),
    qb.limit(query.pageSize).offset((query.page - 1) * query.pageSize),
  ]);
}
