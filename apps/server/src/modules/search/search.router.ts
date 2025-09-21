import * as shared from '@sel/shared';
import { Router } from 'express';

import { Event } from '../event/event.entities';
import { Information } from '../information/information.entities';
import { MemberWithAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { Request } from '../request/request.entities';

import { searchQuery } from './domain/search.query';

export const router = Router();

router.get('/', async (req, res) => {
  const query = shared.searchQuerySchema.parse(req.query);

  const results = await searchQuery(query);

  res.json({
    requests: {
      ...results.requests,
      items: results.requests.items?.map(serializeSearchRequest),
    },
    events: {
      ...results.events,
      items: results.events.items?.map(serializeSearchEvent),
    },
    information: {
      ...results.information,
      items: results.information.items?.map(serializeSearchInformation),
    },
    members: {
      ...results.members,
      items: results.members.items?.map(serializeMember),
    },
  });
});

function serializeSearchRequest(request: Request & { requester: MemberWithAvatar }): shared.SearchRequest {
  return {
    id: request.id,
    title: request.title,
    publishedAt: request.date.toISOString(),
    requester: serializeMember(request.requester),
  };
}

function serializeSearchEvent(event: Event & { organizer: MemberWithAvatar }): shared.SearchEvent {
  return {
    id: event.id,
    title: event.title,
    publishedAt: event.createdAt.toISOString(),
    organizer: serializeMember(event.organizer),
  };
}

function serializeSearchInformation(
  information: Information & { author: MemberWithAvatar | null },
): shared.SearchInformation {
  return {
    id: information.id,
    title: information.title,
    author: information.author ? serializeMember(information.author) : undefined,
    publishedAt: information.publishedAt.toISOString(),
  };
}
