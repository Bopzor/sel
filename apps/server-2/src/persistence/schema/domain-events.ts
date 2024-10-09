import { pgTable, varchar, json } from 'drizzle-orm/pg-core';

import { primaryKey, id, createdAt } from '../schema-utils';

export const domainEvents = pgTable('domain_events', {
  id: primaryKey(),
  entity: varchar('entity', { length: 256 }).notNull(),
  entityId: id('entity_id').notNull(),
  type: varchar('type', { length: 256 }).notNull(),
  payload: json('payload'),
  createdAt,
});
