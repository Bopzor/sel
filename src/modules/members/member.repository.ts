import { GetMemberResult } from './use-cases/get-member/get-member-result';

import { Member } from './index';

export interface MemberRepository {
  listMembers(search?: string): Promise<Member[]>;
  getMember(id: string): Promise<GetMemberResult | undefined>;
}
