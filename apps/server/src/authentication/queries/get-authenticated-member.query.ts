import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export type GetAuthenticatedMemberQuery = {
  memberId: string;
};

export type GetAuthenticatedMemberQueryResult = shared.AuthenticatedMember | undefined;

export class GetAuthenticatedMember
  implements QueryHandler<GetAuthenticatedMemberQuery, GetAuthenticatedMemberQueryResult>
{
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  async handle({ memberId }: GetAuthenticatedMemberQuery): Promise<GetAuthenticatedMemberQueryResult> {
    return this.memberRepository.query_getAuthenticatedMember(memberId);
  }
}
