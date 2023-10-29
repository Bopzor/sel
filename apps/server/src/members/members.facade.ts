import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { MembersRepository } from './members.repository';

export interface MembersFacade {
  getMemberIdFromEmail(email: string): Promise<string | undefined>;
}

export class MembersFacadeImpl implements MembersFacade {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    const member = await this.membersRepository.getMemberFromEmail(email);

    if (member) {
      return member.id;
    }
  }
}

export class StubMembersFacade implements MembersFacade {
  membersEmail = new Map<string, string>();

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    return this.membersEmail.get(email);
  }
}
