import { timestamp, varchar } from 'drizzle-orm/pg-core';

export function id(name = 'id') {
  return varchar(name, { length: 16 });
}

export function primaryKey() {
  return id().primaryKey();
}

export function date<Name extends string>(name: Name) {
  return timestamp(name, {
    mode: 'date',
    precision: 3,
  });
}

export const createdAt = date('created_at').notNull().defaultNow();
export const updatedAt = date('updated_at').notNull().defaultNow();

export function enumValues<Values extends string>(enumType: Record<string, Values>) {
  return Object.values(enumType) as [Values, ...Values[]];
}
