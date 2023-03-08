import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { Member } from '../../index';
import { MemberRepository } from '../../member.repository';

export type ListMembersQuery = {
  search?: string;
};

export class ListMembersHandler implements QueryHandler<ListMembersQuery, Member[]> {
  constructor(private readonly repository: MemberRepository) {}

  handle(query: ListMembersQuery): Promise<Member[]> {
    return this.repository.listMembers(query.search);
  }
}

injected(ListMembersHandler, TOKENS.memberRepository);
