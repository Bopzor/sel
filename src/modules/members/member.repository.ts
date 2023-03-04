import { GetMemberResult } from './use-cases/get-member/get-member-result';

export interface MemberRepository {
  getMember(id: string): Promise<GetMemberResult | undefined>;
}
