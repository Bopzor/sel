import { injected } from 'brandi';

import { InMemoryRepository } from '../../common/in-memory-repository';
import { TOKENS } from '../../tokens';

import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { GetMemberResult } from './use-cases/get-member/get-member-result';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  protected entity = Member;

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
