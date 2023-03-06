import { injected } from 'brandi';

import { InMemoryRepository } from '../../common/in-memory-repository';
import { TOKENS } from '../../tokens';

import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { GetMemberResult } from './use-cases/get-member/get-member-result';
import { ListMembersResult } from './use-cases/list-members/list-members-result';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  protected entity = Member;

  async listMembers(): Promise<ListMembersResult> {
    return this.all().map((member) => ({
      id: member.id,
    }));
  }

  async getMember(id: string): Promise<GetMemberResult | undefined> {
    const member = await this.findById(id);

    if (!member) {
      return;
    }

    return {
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: member.fullName,
    };
  }
}

injected(InMemoryMemberRepository, TOKENS.inMemoryDatabase);
