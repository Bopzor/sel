import { GetMemberResult } from './use-cases/get-member/get-member-result';
import { ListMembersResult } from './use-cases/list-members/list-members-result';

export interface MemberRepository {
  listMembers(): Promise<ListMembersResult>;
  getMember(id: string): Promise<GetMemberResult | undefined>;
}
