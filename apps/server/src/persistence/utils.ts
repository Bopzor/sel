import { SQLWrapper, AnyColumn, sql } from 'drizzle-orm';

export function asc(column: SQLWrapper | AnyColumn, options: { nulls: 'first' | 'last' }) {
  if (options.nulls) {
    return sql`${column} asc nulls ${sql.raw(options.nulls)}`;
  }

  return sql`${column} asc`;
}

export function desc(column: SQLWrapper | AnyColumn, options: { nulls: 'first' | 'last' }) {
  if (options.nulls) {
    return sql`${column} desc nulls ${sql.raw(options.nulls)}`;
  }

  return sql`${column} desc`;
}
