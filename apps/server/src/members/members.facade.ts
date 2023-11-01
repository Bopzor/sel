import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { Member } from './entities/member';
import { MembersRepository } from './members.repository';

export interface MembersFacade {
  getMemberFromId(id: string): Promise<Member | undefined>;
  getMemberIdFromEmail(email: string): Promise<string | undefined>;
}

export class MembersFacadeImpl implements MembersFacade {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async getMemberFromId(id: string): Promise<Member | undefined> {
    return this.membersRepository.getMember(id);
  }

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    const member = await this.membersRepository.getMemberFromEmail(email);

    if (member) {
      return member.id;
    }
  }
}

export class StubMembersFacade implements MembersFacade {
  members = new Array<Member>();

  async getMemberFromId(id: string): Promise<Member | undefined> {
    return this.members.find((member) => member.id === id);
  }

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    return this.members.find((member) => member.email === email)?.id;
  }
}
