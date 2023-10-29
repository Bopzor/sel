import * as shared from '@sel/shared';

import { InMemoryRepository } from '../in-memory.repository';

import { Member } from './entities/member';
import { MembersRepository } from './members.repository';

export class InMemoryMembersRepository extends InMemoryRepository<Member> implements MembersRepository {
  async listMembers(): Promise<shared.Member[]> {
    return this.all();
  }

  async getMember(memberId: string): Promise<shared.Member | undefined> {
    return this.get(memberId);
  }

  async getMemberFromEmail(email: string): Promise<shared.Member | undefined> {
    return this.find((member) => member.email === email);
  }

  async insert(member: Member): Promise<void> {
    this.add(member);
  }
}
