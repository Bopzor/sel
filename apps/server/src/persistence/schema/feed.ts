import { sql } from 'drizzle-orm';
import { pgView, varchar } from 'drizzle-orm/pg-core';

import { date, id } from '../schema-utils';

export const feedView = pgView('feed_view', {
  id: id().notNull(),
  type: varchar({ enum: ['event', 'request', 'information'] }).notNull(),
  createdAt: date('created_at').notNull(),
}).as(sql`
(SELECT e.id, 'event' as type, e.created_at FROM events e)
UNION (SELECT i.id, 'information' as type, i.created_at FROM information i)
UNION (SELECT r.id, 'request' as type, r.created_at FROM requests r)`);
