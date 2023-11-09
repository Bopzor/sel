import * as shared from '@sel/shared';

import { InMemoryRepository } from '../in-memory.repository';

import { Member } from './entities/member';
import { MembersRepository } from './members.repository';

export class InMemoryMembersRepository extends InMemoryRepository<Member> implements MembersRepository {
  private toMember(this: void, member: Member): shared.Member {
    return {
      ...member,
      onboardingCompleted: Boolean(member.onboardingCompletedDate),
    };
  }

  async listMembers(): Promise<shared.Member[]> {
    return this.all().map(this.toMember);
  }

  async getMember(memberId: string): Promise<shared.Member | undefined> {
    const member = this.get(memberId);

    if (member) {
      return this.toMember(member);
    }
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.find((member) => member.email === email);
  }

  async insert(member: Member): Promise<void> {
    this.add(member);
  }
}
