import { Member } from '@sel/shared';

export interface MembersGateway {
  listMembers(): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
}
