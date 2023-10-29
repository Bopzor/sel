import { createFactory, createDate } from '@sel/utils';
import { InferInsertModel } from 'drizzle-orm';

import { members } from './schema';

export const createSqlMember = createFactory<InferInsertModel<typeof members>>(() => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdAt: createDate().toISOString(),
  updatedAt: createDate().toISOString(),
}));
