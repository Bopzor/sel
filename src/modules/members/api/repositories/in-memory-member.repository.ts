import { injected } from 'brandi';

import { transformMember } from '../..';
import { TOKENS } from '../../../../api/tokens';
import { InMemoryRepository } from '../../../../common/in-memory-repository';
import { Member } from '../../entities/member.entity';
import { GetMemberResult } from '../../use-cases/get-member/get-member-result';
import { MemberRepository } from '../member.repository';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  protected entity = Member;

  async listMembers(search?: string): Promise<GetMemberResult[]> {
    const matchMember = (member: Member) => {
      if (!search) {
        return true;
      }

      return [member.fullName, member.email, member.phoneNumber].some((value) => value.includes(search));
    };

    return this.filter(matchMember).map(transformMember);
  }

  async getMember(id: string): Promise<GetMemberResult | undefined> {
    const member = await this.findById(id);

    if (!member) {
      return;
    }

    return transformMember(member);
  }
}

injected(InMemoryMemberRepository, TOKENS.inMemoryDatabase);
