import { createDate, createFactory } from '@sel/utils';

import { TokenType } from '../authentication/token.entity';
import { MemberStatus } from '../members/member.entity';
import { RequestStatus } from '../requests/request.entity';

import { comments, members, requests, tokens } from './schema';

export const createSqlMember = createFactory<typeof members.$inferInsert>(() => ({
  id: '',
  status: MemberStatus.inactive,
  firstName: '',
  lastName: '',
  email: '',
  emailVisible: false,
  createdAt: createDate(),
  updatedAt: createDate(),
}));

export const createSqlToken = createFactory<typeof tokens.$inferInsert>(() => ({
  id: '',
  value: '',
  expirationDate: createDate(),
  type: TokenType.authentication,
  memberId: '',
  revoked: false,
  createdAt: createDate(),
  updatedAt: createDate(),
}));

export const createSqlRequest = createFactory<typeof requests.$inferInsert>(() => ({
  id: '',
  status: RequestStatus.pending,
  requesterId: '',
  title: '',
  text: '',
  html: '',
  createdAt: createDate(),
  updatedAt: createDate(),
}));

export const createSqlComment = createFactory<typeof comments.$inferInsert>(() => ({
  id: '',
  authorId: '',
  date: createDate(),
  html: '',
  text: '',
  createdAt: createDate(),
  updatedAt: createDate(),
}));
