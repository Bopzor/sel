import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export type ListMembersQuery = {
  sort?: shared.MembersSort;
};

export type ListMembersQueryResult = shared.Member[];

export class ListMembers implements QueryHandler<ListMembersQuery, ListMembersQueryResult> {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  handle({ sort }: ListMembersQuery): Promise<ListMembersQueryResult> {
    return this.memberRepository.query_listMembers(sort ?? shared.MembersSort.firstName);
  }
}
