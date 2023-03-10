import { createId } from '../../../../common/create-id';
import { Factory } from '../../../../common/factory';
import { Member } from '../../../members';
import { createGetMemberResult } from '../../../members/use-cases/get-member/get-member-result';

export type GetRequestResult = {
  id: string;
  requester: Member;
  title: string;
  description: string;
  creationDate: string;
  lastEditionDate: string;
};

export const createGetRequestResult: Factory<GetRequestResult> = (overrides) => ({
  id: createId(),
  requester: createGetMemberResult(),
  title: '',
  description: '',
  creationDate: '',
  lastEditionDate: '',
  ...overrides,
});
