import * as shared from '@sel/shared';
import { eq, sql } from 'drizzle-orm';
import { pgView, QueryBuilder } from 'drizzle-orm/pg-core';

import { comments } from './comments';
import { events } from './events';
import { information } from './information';
import { members } from './members';
import { messages } from './messages';
import { requests } from './requests';

const searchEvents = (qb: QueryBuilder) =>
  qb
    .select({
      id: events.id,
      resourceType: sql`'event'`.as('resource_type'),
      parentResourceType: sql`NULL`.as('parent_resource_type'),
      parentId: sql`NULL`.as('parent_id'),
      title: events.title,
      text: messages.text,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(messages, eq(events.messageId, messages.id));

const searchInfo = (qb: QueryBuilder) =>
  qb
    .select({
      id: information.id,
      resourceType: sql`'information'`.as('resource_type'),
      parentResourceType: sql`NULL`.as('parent_resource_type'),
      parentId: sql`NULL`.as('parent_id'),
      title: information.title,
      text: messages.text,
      createdAt: information.createdAt,
    })
    .from(information)
    .leftJoin(messages, eq(information.messageId, messages.id));

const searchRequests = (qb: QueryBuilder) =>
  qb
    .select({
      id: requests.id,
      resourceType: sql`'request'`.as('resource_type'),
      parentResourceType: sql`NULL`.as('parent_resource_type'),
      parentId: sql`NULL`.as('parent_id'),
      title: requests.title,
      text: messages.text,
      createdAt: requests.createdAt,
    })
    .from(requests)
    .leftJoin(messages, eq(requests.messageId, messages.id));

const searchComments = (qb: QueryBuilder) =>
  qb
    .select({
      id: comments.id,
      resourceType: sql`'comment'`.as('resource_type'),
      parentResourceType:
        sql`CASE WHEN comments.requestId IS NOT NULL THEN 'request' WHEN comments.informationId IS NOT NULL THEN 'information' WHEN comments.eventId IS NOT NULL THEN 'event' ELSE NULL END`.as(
          'parent_resource_type',
        ),
      parentId:
        sql`CASE WHEN comments.requestId IS NOT NULL THEN comments.requestId WHEN comments.informationId IS NOT NULL THEN comments.informationId WHEN comments.eventId IS NOT NULL THEN comments.eventId ELSE NULL END`.as(
          'parent_id',
        ),
      title: sql<string>`NULL`.as('title'),
      text: messages.text,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(messages, eq(comments.messageId, messages.id));

const searchMembers = (qb: QueryBuilder) =>
  qb
    .select({
      id: members.id,
      resourceType: sql`'member'`.as('resource_type'),
      parentResourceType: sql`NULL`.as('parentResourceType'),
      parentId: sql`NULL`.as('parentId'),
      title: sql<string>`members.first_name || ' ' || members.last_name`.as('title'),
      text: sql<string>`NULL`.as('text'),
      createdAt: members.createdAt,
    })
    .from(members)
    .where(eq(members.status, shared.MemberStatus.active));

export const searchView = pgView('search_view').as((qb) =>
  searchEvents(qb)
    .union(searchInfo(qb))
    .union(searchRequests(qb))
    .union(searchComments(qb))
    .union(searchMembers(qb)),
);
