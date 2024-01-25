import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export type ListMembersQuery = {
  sort?: shared.MembersSort;
};

export class ListMembers {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  handle({ sort }: ListMembersQuery): Promise<shared.Member[]> {
    return this.memberRepository.query_listMembers(sort ?? shared.MembersSort.firstName);
  }
}
