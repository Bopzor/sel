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

export type ResourceType = 'event' | 'request' | 'information';

export type FeedItem =
  | [Extract<ResourceType, 'event'>, FeedEvent]
  | [Extract<ResourceType, 'request'>, FeedRequest]
  | [Extract<ResourceType, 'information'>, FeedInformation];

export type Feed = Array<FeedItem>;

export const feedQuerySchema = z.object({
  search: z.string().optional(),
  sortOrder: z
    .union([z.literal('desc'), z.literal('asc')])
    .optional()
    .default('desc'),
  resourceType: z.literal<ResourceType[]>(['event', 'request', 'information']).optional(),
  page: z.coerce.number().optional().default(1),
});
