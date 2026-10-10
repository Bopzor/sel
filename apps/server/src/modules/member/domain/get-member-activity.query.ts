import * as shared from '@sel/shared';
import { assert, awaitProperties, defined, hasProperty } from '@sel/utils';
import { and, Column, desc, eq, or, sql, SQLWrapper } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { serializeMember } from 'src/modules/member/member.serializer';
import { db, paginated, schema } from 'src/persistence';

type GetMemberActivityQuery = {
  memberId: string;
  includeComments: boolean;
  page: number;
  pageSize: number;
};

export async function getMemberActivity(query: GetMemberActivityQuery) {
  const [total, results] = await paginated(query, activity(query));

  const ids = (type: shared.MemberActivityType) => {
    return results.filter(hasProperty('type', type)).map(({ id }) => id);
  };

  const find = <T>(type: shared.MemberActivityType, findMany: (ids: string[]) => Promise<T[]>) => {
    return ids(type).length > 0 ? findMany(ids(type)) : Promise.resolve([]);
  };

  const rows = await awaitProperties({
    requests: find('request', (ids) => db.query.requests.findMany({ where: { id: { in: ids } } })),
    positiveRequestAnswers: find('request-answer', (ids) =>
      db.query.requestAnswers.findMany({ where: { id: { in: ids } }, with: { request: true } }),
    ),
    events: find('event', (ids) => db.query.events.findMany({ where: { id: { in: ids } } })),
    eventParticipations: find('event-participation', (ids) =>
      db.query.eventParticipations.findMany({ where: { id: { in: ids } }, with: { event: true } }),
    ),
    information: find('information', (ids) => db.query.information.findMany({ where: { id: { in: ids } } })),
    comments: find('comment', (ids) =>
      db.query.comments.findMany({
        where: { id: { in: ids } },
        with: { request: true, event: true, information: true, message: true },
      }),
    ),
    transactions: find('transaction', (ids) =>
      db.query.transactions.findMany({
        where: { id: { in: ids } },
        with: { payer: withAvatar, recipient: withAvatar },
      }),
    ),
  });

  return {
    total,
    items: results.map(({ type, id }): shared.MemberActivityItem => {
      const findRow = <T extends { id: string }>(rows: T[]) => defined(rows.find(hasProperty('id', id)));

      switch (type) {
        case 'request': {
          const request = findRow(rows.requests);
          return { type, id, date: request.createdAt.toISOString(), entity: requestEntity(request) };
        }

        case 'request-answer': {
          const answer = findRow(rows.positiveRequestAnswers);
          return { type, id, date: answer.updatedAt.toISOString(), entity: requestEntity(answer.request) };
        }

        case 'event': {
          const event = findRow(rows.events);
          return { type, id, date: event.createdAt.toISOString(), entity: eventEntity(event) };
        }

        case 'event-participation': {
          const participation = findRow(rows.eventParticipations);
          return {
            type,
            id,
            date: participation.updatedAt.toISOString(),
            entity: eventEntity(participation.event),
          };
        }

        case 'information': {
          const information = findRow(rows.information);
          return {
            type,
            id,
            date: information.publishedAt.toISOString(),
            entity: informationEntity(information),
          };
        }

        case 'comment': {
          const comment = findRow(rows.comments);
          return {
            type,
            id,
            date: comment.date.toISOString(),
            entity: commentEntity(comment),
            body: comment.message.html,
          };
        }

        case 'transaction': {
          const transaction = findRow(rows.transactions);
          return {
            type,
            id,
            date: (transaction.completedAt ?? transaction.createdAt).toISOString(),
            amount: transaction.amount,
            description: transaction.description,
            payer: serializeMember(transaction.payer),
            recipient: serializeMember(transaction.recipient),
          };
        }
      }
    }),
  };
}

function activity({ memberId, includeComments }: GetMemberActivityQuery) {
  const { requests, events, information, requestAnswers, eventParticipations, comments, transactions } =
    schema;

  const source = (type: shared.MemberActivityType, id: Column, date: Column) => ({
    id: sql`${id}`.as('id'),
    type: sql`${type}::text`.as('type'),
    date: sql`${date}`.as('date'),
  });

  const sources: SQLWrapper[] = [
    db
      .select(source('request', requests.id, requests.createdAt))
      .from(requests)
      .where(eq(requests.requesterId, memberId)),
    db
      .select(source('request-answer', requestAnswers.id, requestAnswers.updatedAt))
      .from(requestAnswers)
      .where(and(eq(requestAnswers.memberId, memberId), eq(requestAnswers.answer, 'positive'))),
    db
      .select(source('event', events.id, events.createdAt))
      .from(events)
      .where(eq(events.organizerId, memberId)),
    db
      .select(source('event-participation', eventParticipations.id, eventParticipations.updatedAt))
      .from(eventParticipations)
      .where(
        and(eq(eventParticipations.participantId, memberId), eq(eventParticipations.participation, 'yes')),
      ),
    db
      .select(source('information', information.id, information.publishedAt))
      .from(information)
      .where(eq(information.authorId, memberId)),
    db
      .select(source('transaction', transactions.id, transactions.completedAt))
      .from(transactions)
      .where(
        and(
          eq(transactions.status, shared.TransactionStatus.completed),
          or(eq(transactions.payerId, memberId), eq(transactions.recipientId, memberId)),
        ),
      ),
  ];

  if (includeComments) {
    sources.push(
      db
        .select(source('comment', comments.id, comments.date))
        .from(comments)
        .where(eq(comments.authorId, memberId)),
    );
  }

  const union = sql.join(
    sources.map((source) => sql`(${source})`),
    sql` union all `,
  );

  return db
    .select({ id: sql<string>`id`, type: sql<shared.MemberActivityType>`type` })
    .from(sql`(${union}) as activity`)
    .orderBy(desc(sql`date`), desc(sql`id`))
    .$dynamic();
}

type Entity = { id: string; title: string };

function requestEntity({ id, title }: Entity) {
  return { type: 'request' as const, id, title };
}

function eventEntity({ id, title, date }: Entity & { date: Date | null }) {
  return { type: 'event' as const, id, title, date: date?.toISOString() };
}

function informationEntity({ id, title }: Entity) {
  return { type: 'information' as const, id, title };
}

function commentEntity(comment: {
  request: Entity | null;
  event: (Entity & { date: Date | null }) | null;
  information: Entity | null;
}) {
  if (comment.request) {
    return requestEntity(comment.request);
  }

  if (comment.event) {
    return eventEntity(comment.event);
  }

  assert(comment.information);

  return informationEntity(comment.information);
}
