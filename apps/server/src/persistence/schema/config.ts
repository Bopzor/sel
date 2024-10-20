import { pgTable, varchar, real } from 'drizzle-orm/pg-core';

import { createdAt, primaryKey, updatedAt } from '../schema-utils';

export const config = pgTable('config', {
  id: primaryKey(),
  letsName: varchar('lets_name', { length: 256 }).notNull().default(''),
  logoUrl: varchar('logo_url', { length: 256 }).notNull().default(''),
  currency: varchar('currency', { length: 256 }).notNull(),
  currencyPlural: varchar('currency_plural', { length: 256 }).notNull(),
  mapLongitude: real('map_longitude').notNull().default(0),
  mapLatitude: real('map_latitude').notNull().default(0),
  mapZoom: varchar('map_zoom', { length: 256 }).notNull().default(''),
  createdAt,
  updatedAt,
});
