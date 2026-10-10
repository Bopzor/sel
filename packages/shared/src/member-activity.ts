import { createDate, createFactory, createId } from '@sel/utils';
import { z } from 'zod';

import type { LightMember } from './member';

type ActivityEntity<Type extends string> = {
  type: Type;
  id: string;
  title: string;
  date?: string;
};

export type MemberActivityItem = {
  id: string;
  date: string;
} & (
  | { type: 'request'; entity: ActivityEntity<'request'> }
  | { type: 'request-answer'; entity: ActivityEntity<'request'> }
  | { type: 'event'; entity: ActivityEntity<'event'> }
  | { type: 'event-participation'; entity: ActivityEntity<'event'> }
  | { type: 'information'; entity: ActivityEntity<'information'> }
  | { type: 'comment'; entity: ActivityEntity<'request' | 'event' | 'information'>; body: string }
  | { type: 'transaction'; amount: number; description: string; payer: LightMember; recipient: LightMember }
);

export type MemberActivityType = MemberActivityItem['type'];

export type MemberActivityCounts = {
  requests: number;
  requestAnswers: number;
  events: number;
  eventParticipations: number;
  information: number;
  comments: number;
};

export const listMemberActivityQuerySchema = z.object({
  includeComments: z.stringbool().default(false),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListMemberActivityQuery = z.input<typeof listMemberActivityQuerySchema>;

export const createMemberActivityItem = createFactory<MemberActivityItem>(() => ({
  id: createId(),
  date: createDate().toISOString(),
  type: 'request',
  entity: { type: 'request', id: createId(), title: '' },
}));
