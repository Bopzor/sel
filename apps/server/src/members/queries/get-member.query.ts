import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export type GetMemberQuery = {
  memberId: string;
};

export class GetMember {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly memberRepository: MemberRepository) {}

  handle({ memberId }: GetMemberQuery): Promise<shared.Member | undefined> {
    return this.memberRepository.query_getMember(memberId);
  }
}
