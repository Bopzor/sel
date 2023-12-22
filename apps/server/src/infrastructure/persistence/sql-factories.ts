import { createDate, createFactory } from '@sel/utils';

import { TokenType } from '../../authentication/token.entity';
import { MemberStatus } from '../../members/entities';
import { RequestStatus } from '../../requests/request.entity';

import { members, requests, tokens } from './schema';

const createISOStringDate = () => createDate().toISOString();

export const createSqlMember = createFactory<typeof members.$inferInsert>(() => ({
  id: '',
  status: MemberStatus.inactive,
  firstName: '',
  lastName: '',
  email: '',
  emailVisible: false,
  createdAt: createISOStringDate(),
  updatedAt: createISOStringDate(),
}));

export const createSqlToken = createFactory<typeof tokens.$inferInsert>(() => ({
  id: '',
  value: '',
  expirationDate: createISOStringDate(),
  type: TokenType.authentication,
  memberId: '',
  revoked: false,
  createdAt: createISOStringDate(),
  updatedAt: createISOStringDate(),
}));

export const createSqlRequest = createFactory<typeof requests.$inferInsert>(() => ({
  id: '',
  status: RequestStatus.pending,
  requesterId: '',
  title: '',
  text: '',
  html: '',
  createdAt: createISOStringDate(),
  updatedAt: createISOStringDate(),
}));
