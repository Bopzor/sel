import { Member } from '@sel/shared';

import { InMemoryRepository } from '../in-memory.repository';

import { InsertMemberModel, MembersRepository } from './members.repository';

export class InMemoryMembersRepository extends InMemoryRepository<Member> implements MembersRepository {
  async listMembers(): Promise<Member[]> {
    return this.all();
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return this.get(memberId);
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.find((member) => member.email === email);
  }

  async insert(member: InsertMemberModel): Promise<void> {
    this.add({
      ...member,
      phoneNumbers: [],
    });
  }
}
