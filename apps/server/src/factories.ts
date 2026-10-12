import * as shared from '@sel/shared';
import { createDate, createId } from '@sel/utils';
import { sql } from 'drizzle-orm';
import { PgInsertValue, PgTable } from 'drizzle-orm/pg-core';

import { TokenInsert, TokenType } from './modules/authentication/authentication.entities';
import { CommentInsert } from './modules/comment/comment.entities';
import { EventInsert, EventParticipationInsert } from './modules/event/event.entities';
import { FileInsert } from './modules/file/file.entity';
import { InformationInsert } from './modules/information/information.entities';
import { InterestInsert } from './modules/interest/interest.entities';
import { MemberInsert } from './modules/member/member.entities';
import { MessageInsert } from './modules/messages/message.entities';
import { MemberDeviceInsert } from './modules/notification/notification.entities';
import { RequestAnswerInsert, RequestInsert } from './modules/request/request.entities';
import { TransactionInsert } from './modules/transaction/transaction.entities';
import { db } from './persistence';
import {
  comments,
  eventParticipations,
  events,
  files,
  information,
  interests,
  memberDevices,
  memberNumberSequence,
  members,
  messages,
  requestAnswers,
  requests,
  tokens,
  transactions,
} from './persistence/schema';

// The required references that are not given are persisted with their defaults.
export const persist = {
  member: (values: Partial<MemberInsert> = {}) =>
    insert(members, {
      id: createId(),
      number: sql`nextval(${memberNumberSequence.seqName})`,
      status: shared.MemberStatus.active,
      firstName: '',
      lastName: '',
      email: createId(),
      emailVisible: false,
      ...values,
    }),

  token: async (values: Partial<TokenInsert> = {}) =>
    insert(tokens, {
      id: createId(),
      value: createId(),
      expirationDate: createDate(),
      type: TokenType.authentication,
      ...values,
      memberId: values.memberId ?? (await persist.member()),
    }),

  memberDevice: async (values: Partial<MemberDeviceInsert> = {}) =>
    insert(memberDevices, {
      id: createId(),
      deviceSubscription: '',
      deviceType: '',
      ...values,
      memberId: values.memberId ?? (await persist.member()),
    }),

  file: async (values: Partial<FileInsert> = {}) =>
    insert(files, {
      id: createId(),
      name: '',
      originalName: '',
      mimetype: '',
      size: 0,
      ...values,
      uploadedBy: values.uploadedBy ?? (await persist.member()),
    }),

  interest: (values: Partial<InterestInsert> = {}) =>
    insert(interests, {
      id: createId(),
      label: '',
      description: '',
      ...values,
    }),

  message: (values: Partial<MessageInsert> = {}) =>
    insert(messages, {
      id: createId(),
      text: '',
      html: '',
      ...values,
    }),

  request: async (values: Partial<RequestInsert> = {}) =>
    insert(requests, {
      id: createId(),
      status: shared.RequestStatus.pending,
      title: '',
      ...values,
      requesterId: values.requesterId ?? (await persist.member()),
      messageId: values.messageId ?? (await persist.message()),
    }),

  requestAnswer: async (values: Partial<RequestAnswerInsert> = {}) =>
    insert(requestAnswers, {
      id: createId(),
      date: createDate(),
      answer: 'positive',
      ...values,
      requestId: values.requestId ?? (await persist.request()),
      memberId: values.memberId ?? (await persist.member()),
    }),

  event: async (values: Partial<EventInsert> = {}) =>
    insert(events, {
      id: createId(),
      title: '',
      kind: 'internal',
      ...values,
      organizerId: values.organizerId ?? (await persist.member()),
      messageId: values.messageId ?? (await persist.message()),
    }),

  eventParticipation: async (values: Partial<EventParticipationInsert> = {}) =>
    insert(eventParticipations, {
      id: createId(),
      participation: 'yes',
      ...values,
      eventId: values.eventId ?? (await persist.event()),
      participantId: values.participantId ?? (await persist.member()),
    }),

  comment: async (values: Partial<CommentInsert> = {}) =>
    insert(comments, {
      id: createId(),
      date: createDate(),
      ...values,
      authorId: values.authorId ?? (await persist.member()),
      messageId: values.messageId ?? (await persist.message()),
    }),

  information: async (values: Partial<InformationInsert> = {}) =>
    insert(information, {
      id: createId(),
      title: '',
      publishedAt: createDate(),
      ...values,
      messageId: values.messageId ?? (await persist.message()),
    }),

  transaction: async (values: Partial<TransactionInsert> = {}) =>
    insert(transactions, {
      id: createId(),
      status: shared.TransactionStatus.pending,
      description: '',
      amount: 0,
      ...values,
      payerId: values.payerId ?? (await persist.member()),
      recipientId: values.recipientId ?? (await persist.member()),
      creatorId: values.creatorId ?? (await persist.member()),
    }),
};

async function insert<Table extends PgTable>(table: Table, values: PgInsertValue<Table>): Promise<string> {
  const [{ id }] = await db
    .insert(table)
    .values(values)
    .returning({ id: sql<string>`id` })
    .execute();

  return id;
}
