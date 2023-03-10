import { Member } from '../index';
import { GetMemberResult } from '../use-cases/get-member/get-member-result';

export interface MemberRepository {
  listMembers(search?: string): Promise<Member[]>;
  getMember(id: string): Promise<GetMemberResult | undefined>;
}
