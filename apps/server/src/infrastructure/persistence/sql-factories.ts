import { createFactory, createDate } from '@sel/utils';
import { InferInsertModel } from 'drizzle-orm';

import { TokenType } from '../../authentication/token.entity';

import { members, tokens } from './schema';

const createISOStringDate = () => createDate().toISOString();

export const createSqlMember = createFactory<InferInsertModel<typeof members>>(() => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdAt: createISOStringDate(),
  updatedAt: createISOStringDate(),
}));

export const createSqlToken = createFactory<InferInsertModel<typeof tokens>>(() => ({
  id: '',
  value: '',
  expirationDate: createISOStringDate(),
  type: TokenType.authentication,
  memberId: '',
  revoked: false,
  createdAt: createISOStringDate(),
  updatedAt: createISOStringDate(),
}));
