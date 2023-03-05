import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { MemberRepository } from '../../member.repository';

import { GetMemberResult } from './get-member-result';

export type GetMemberQuery = {
  id: string;
};

export class GetMemberHandler implements QueryHandler<GetMemberQuery, GetMemberResult | undefined> {
  constructor(private readonly repository: MemberRepository) {}

  handle(query: GetMemberQuery): Promise<GetMemberResult | undefined> {
    return this.repository.getMember(query.id);
  }
}

injected(GetMemberHandler, TOKENS.memberRepository);
