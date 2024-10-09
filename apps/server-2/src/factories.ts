import { createFactory, createId } from '@sel/utils';

import { MemberInsert, MemberStatus } from './modules/member/member.entities';

export const insert = {
  member: createFactory<MemberInsert>(() => ({
    id: createId(),
    status: MemberStatus.active,
    firstName: '',
    lastName: '',
    email: '',
    emailVisible: false,
  })),
};
