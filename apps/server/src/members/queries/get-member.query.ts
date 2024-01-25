import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export type GetMemberQuery = {
  memberId: string;
};

export type GetMemberQueryResult = shared.Member | undefined;

export class GetMember implements QueryHandler<GetMemberQuery, GetMemberQueryResult> {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  handle({ memberId }: GetMemberQuery): Promise<GetMemberQueryResult> {
    return this.memberRepository.query_getMember(memberId);
  }
}
