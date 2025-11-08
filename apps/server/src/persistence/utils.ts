import { PgSelect } from 'drizzle-orm/pg-core';

import { db } from './database';

export async function paginated<T extends PgSelect>(
  qb: T,
  { page, pageSize }: { page: number; pageSize: number },
) {
  return [await db.$count(qb), await qb.limit(pageSize).offset((page - 1) * pageSize)] as const;
}
