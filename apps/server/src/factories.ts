import { createFactory, createId } from '@sel/utils';

import { InterestInsert } from './modules/interest/interest.entities';
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

  interest: createFactory<InterestInsert>(() => ({
    id: createId(),
    label: '',
    description: '',
  })),
};
