import { Member, MembersSort } from '@sel/shared';

export interface MembersGateway {
  listMembers(sort?: MembersSort): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
}
