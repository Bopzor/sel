import { createDate, createFactory, createId } from '@sel/utils';

import { TokenInsert, TokenType } from './modules/authentication/authentication.entities';
import { InterestInsert } from './modules/interest/interest.entities';
import { MemberInsert, MemberStatus } from './modules/member/member.entities';

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
