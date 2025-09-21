import z from 'zod';

import { LightMember } from './member';

export const searchQuerySchema = z.object({
  search: z.string(),
  page: z.number().optional(),
  resourceType: z.literal(['request', 'event', 'information', 'member']).optional(),
});

export type SearchEvent = {
  id: string;
  title: string;
  organizer: LightMember;
  publishedAt: string;
};

export type SearchRequest = {
  id: string;
  title: string;
  requester: LightMember;
  publishedAt: string;
};

export type SearchInformation = {
  id: string;
  title: string;
  author?: LightMember;
  publishedAt: string;
};

export type SearchResult<T extends SearchRequest | SearchEvent | SearchInformation | LightMember> = {
  items: {
    item: T;
    commentsOnly?: boolean;
    commentIds?: string[];
  }[];
  total: number;
};

export type SearchResults = {
  requests: SearchResult<SearchRequest>;
  events: SearchResult<SearchEvent>;
  information: SearchResult<SearchInformation>;
  members: SearchResult<LightMember>;
};
