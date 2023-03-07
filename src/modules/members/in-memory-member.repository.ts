import { injected } from 'brandi';

import { InMemoryRepository } from '../../common/in-memory-repository';
import { TOKENS } from '../../tokens';

import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { GetMemberResult } from './use-cases/get-member/get-member-result';
import { ListMembersResult } from './use-cases/list-members/list-members-result';

export class InMemoryMemberRepository extends InMemoryRepository<Member> implements MemberRepository {
  protected entity = Member;

  async listMembers(search?: string): Promise<ListMembersResult> {
    const matchMember = (member: Member) => {
      if (!search) {
        return true;
      }

      return [member.fullName, member.email, member.phoneNumber].some((value) => value.includes(search));
    };

    return this.filter(matchMember).map(this.transformToResult);
  }

  async getMember(id: string): Promise<GetMemberResult | undefined> {
    const member = await this.findById(id);

    if (!member) {
      return;
    }

    return this.transformToResult(member);
  }

  private transformToResult(this: void, member: Member) {
    return {
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: member.fullName,
      address: {
        line1: member.address.line1,
        line2: member.address.line2,
        postalCode: member.address.postalCode,
        city: member.address.city,
        country: member.address.country,
        position: member.address.position,
      },
    };
  }
}

injected(InMemoryMemberRepository, TOKENS.inMemoryDatabase);
