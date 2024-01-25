import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export class GetAuthenticatedMember {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  async handle(memberId: string): Promise<shared.AuthenticatedMember | undefined> {
    return this.memberRepository.query_getAuthenticatedMember(memberId);
  }
}
