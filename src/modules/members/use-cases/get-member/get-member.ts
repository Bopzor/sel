import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { QueryHandler } from '../../../../common/cqs/query-handler';
import { MemberRepository } from '../../api/member.repository';

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
