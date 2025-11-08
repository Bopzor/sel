import z from 'zod';

import { Address } from './address';
import { LightMember } from './member';
import { Message } from './message';
import { RequestStatus } from './request';

export type FeedEvent = {
  id: string;
  title: string;
  message: Message;
  location?: Address;
  organizer: LightMember;
  publishedAt: string;
};

export type FeedRequest = {
  id: string;
  status: RequestStatus;
  requester: LightMember;
  title: string;
  message: Message;
  publishedAt: string;
};

export type FeedInformation = {
  id: string;
  title: string;
  message: Message;
  author?: LightMember;
  publishedAt: string;
};

export type FeedItem = ['event', FeedEvent] | ['request', FeedRequest] | ['information', FeedInformation];

export type Feed = Array<FeedItem>;

export const feedQuerySchema = z.object({
  search: z.string().optional(),
  sortOrder: z
    .union([z.literal('desc'), z.literal('asc')])
    .optional()
    .default('desc'),
  resourceType: z.union([z.literal('event'), z.literal('request'), z.literal('information')]).optional(),
});
