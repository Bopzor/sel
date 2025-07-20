import * as shared from '@sel/shared';
import express from 'express';

import { Event } from '../event/event.entities';
import { Information } from '../information/information.entities';
import { MemberWithAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { Request } from '../request/request.entities';

import { getFeed } from './domain/get-feed.query';

export const router = express.Router();

router.get('/', async (req, res) => {
  const resources = await getFeed();

  res.json(
    resources.map(([type, resource]) => {
      if (type === 'event') {
        return ['event', serializeFeedEvent(resource)];
      }

      if (type === 'request') {
        return ['request', serializeFeedRequest(resource)];
      }

      if (type === 'information') {
        return ['information', serializeFeedInformation(resource)];
      }

      return type;
    }),
  );
});

function serializeFeedEvent(event: Event & { organizer: MemberWithAvatar }): shared.FeedEvent {
  return {
    id: event.id,
    title: event.title,
    body: event.html,
    publishedAt: event.createdAt.toISOString(),
    location: event.location ?? undefined,
    organizer: serializeMember(event.organizer),
  };
}

function serializeFeedRequest(request: Request & { requester: MemberWithAvatar }): shared.FeedRequest {
  return {
    id: request.id,
    status: request.status,
    publishedAt: request.date.toISOString(),
    requester: serializeMember(request.requester),
    title: request.title,
    body: request.html,
  };
}

function serializeFeedInformation(
  information: Information & { author: MemberWithAvatar | null },
): shared.FeedInformation {
  return {
    id: information.id,
    title: information.title,
    body: information.html,
    author: information.author ? serializeMember(information.author) : undefined,
    publishedAt: information.publishedAt.toISOString(),
  };
}
