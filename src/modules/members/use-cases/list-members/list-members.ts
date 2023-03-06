import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { MemberRepository } from '../../member.repository';

import { ListMembersResult } from './list-members-result';

export type ListMembersQuery = {
  search?: string;
};

export class ListMembersHandler implements QueryHandler<ListMembersQuery, ListMembersResult> {
  constructor(private readonly repository: MemberRepository) {}

  handle(query: ListMembersQuery): Promise<ListMembersResult> {
    return this.repository.listMembers();
  }
}

injected(ListMembersHandler, TOKENS.memberRepository);
