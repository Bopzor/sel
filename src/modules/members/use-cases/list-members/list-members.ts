import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { MemberRepository } from '../../member.repository';
import { GetMemberResult } from '../get-member/get-member-result';

export type ListMembersQuery = {
  search?: string;
};

export class ListMembersHandler implements QueryHandler<ListMembersQuery, GetMemberResult[]> {
  constructor(private readonly repository: MemberRepository) {}

  handle(query: ListMembersQuery): Promise<GetMemberResult[]> {
    return this.repository.listMembers(query.search);
  }
}

injected(ListMembersHandler, TOKENS.memberRepository);
