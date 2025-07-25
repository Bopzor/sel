import { Address } from './address';
import { LightMember } from './member';
import { RequestStatus } from './request';

export type FeedEvent = {
  id: string;
  title: string;
  body: string;
  location?: Address;
  organizer: LightMember;
  publishedAt: string;
};

export type FeedRequest = {
  id: string;
  status: RequestStatus;
  requester: LightMember;
  title: string;
  body: string;
  publishedAt: string;
};

export type FeedInformation = {
  id: string;
  title: string;
  body: string;
  author?: LightMember;
  publishedAt: string;
};

export type FeedItem = ['event', FeedEvent] | ['request', FeedRequest] | ['information', FeedInformation];

export type Feed = Array<FeedItem>;
