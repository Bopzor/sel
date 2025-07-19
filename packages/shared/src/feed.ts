import { Address } from './address';
import { LightMember } from './member';
import { RequestStatus } from './request';

export type FeedEvent = {
  id: string;
  title: string;
  body: string;
  date?: string;
  location?: Address;
  organizer: LightMember;
};

export type FeedRequest = {
  id: string;
  status: RequestStatus;
  date: string;
  requester: LightMember;
  title: string;
  body: string;
};

export type FeedInformation = {
  id: string;
  body: string;
  author?: LightMember;
  publishedAt: string;
};

export type Feed = Array<['event', FeedEvent] | ['request', FeedRequest] | ['information', FeedInformation]>;
