import { GetMemberResult } from '../../use-cases/get-member/get-member-result';

export interface MemberRepository {
  listMembers(search?: string): Promise<GetMemberResult[]>;
  getMember(id: string): Promise<GetMemberResult | undefined>;
}
