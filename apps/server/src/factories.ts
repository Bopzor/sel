import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

import { TokenInsert, TokenType } from './modules/authentication/authentication.entities';
import { FileInsert } from './modules/file/file.entity';
import { InterestInsert } from './modules/interest/interest.entities';
import { MemberInsert } from './modules/member/member.entities';
import { RequestInsert } from './modules/request/request.entities';

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

  file: createFactory<FileInsert>(() => ({
    id: createId(),
    name: '',
    originalName: '',
    mimetype: '',
    size: 0,
    uploadedBy: '',
  })),
};
