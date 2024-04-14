import { EventKind } from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

import * as schema from '../persistence/schema';

export type Event = typeof schema.events.$inferSelect;

export const createEvent = createFactory<Event>(() => ({
  id: createId(),
  organizerId: '',
  title: '',
  text: '',
  html: '',
  date: null,
  location: null,
  kind: EventKind.internal,
  createdAt: createDate(),
  updatedAt: createDate(),
}));
