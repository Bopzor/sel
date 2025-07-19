import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';
import { sql } from 'drizzle-orm';
import { PgTable, TableConfig } from 'drizzle-orm/pg-core';

import { TokenInsert, TokenType } from './modules/authentication/authentication.entities';
import { EventInsert } from './modules/event/event.entities';
import { FileInsert } from './modules/file/file.entity';
import { InformationInsert } from './modules/information/information.entities';
import { InterestInsert } from './modules/interest/interest.entities';
import { MemberInsert } from './modules/member/member.entities';
import { RequestInsert } from './modules/request/request.entities';
import { db } from './persistence';
import { events, information, members, requests } from './persistence/schema';

export const insert = {
  token: createFactory<TokenInsert>(() => ({
    id: createId(),
    value: '',
    expirationDate: createDate(),
    type: TokenType.authentication,
    memberId: '',
  })),

  member: createFactory<MemberInsert>(() => ({
    id: createId(),
    number: Math.floor((2 << 16) * Math.random()),
    status: shared.MemberStatus.active,
    firstName: '',
    lastName: '',
    email: createId(),
    emailVisible: false,
  })),

  interest: createFactory<InterestInsert>(() => ({
    id: createId(),
    label: '',
    description: '',
    imageId: '',
  })),

  request: createFactory<RequestInsert>(() => ({
    id: createId(),
    status: shared.RequestStatus.pending,
    requesterId: '',
    title: '',
    text: '',
    html: '',
  })),

  event: createFactory<EventInsert>(() => ({
    id: createId(),
    organizerId: '',
    title: '',
    text: '',
    html: '',
    kind: 'internal',
  })),

  information: createFactory<InformationInsert>(() => ({
    id: createId(),
    text: '',
    html: '',
    isPin: false,
    authorId: '',
    publishedAt: createDate(),
  })),

  file: createFactory<FileInsert>(() => ({
    id: createId(),
    name: '',
    originalName: '',
    mimetype: '',
    size: 0,
    uploadedBy: '',
  })),
};

export const persist = {
  member: persister(members, insert.member),
  request: persister(requests, insert.request),
  event: persister(events, insert.event),
  information: persister(information, insert.information),
};

function persister<T extends TableConfig>(
  table: PgTable<T>,
  inserter: (values?: Partial<typeof table.$inferInsert>) => typeof table.$inferInsert,
) {
  return async (values?: Partial<typeof table.$inferInsert>) => {
    const [{ id }] = await db
      .insert(table)
      .values(inserter(values))
      .returning({ id: sql<string>`id` })
      .execute();

    return id;
  };
}
