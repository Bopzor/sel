import { Member, MembersSort } from '@sel/shared';

export type InsertMemberModel = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export interface MembersRepository {
  listMembers(sort: MembersSort): Promise<Member[]>;
  getMember(memberId: string): Promise<Member | undefined>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
  insert(member: InsertMemberModel): Promise<void>;
}
