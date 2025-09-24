import z from 'zod';

import { LightMember } from './member';

export const searchQuerySchema = z.object({
  search: z.string(),
  page: z.coerce.number().optional(),
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

export type SearchItem = SearchRequest | SearchEvent | SearchInformation | LightMember;

export type SearchResult<T extends SearchItem> = {
  items?: T[];
  total: number;
};

export type SearchResults = {
  requests: SearchResult<SearchRequest>;
  events: SearchResult<SearchEvent>;
  information: SearchResult<SearchInformation>;
  members: SearchResult<LightMember>;
};
