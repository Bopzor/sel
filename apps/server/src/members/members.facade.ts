import { AuthenticatedMember, Member } from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { MembersRepository } from './members.repository';

export interface MembersFacade {
  getAuthenticatedMemberFromId(id: string): Promise<AuthenticatedMember | undefined>;
  getMemberIdFromEmail(email: string): Promise<string | undefined>;
}

export class MembersFacadeImpl implements MembersFacade {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async getAuthenticatedMemberFromId(id: string): Promise<AuthenticatedMember | undefined> {
    return this.membersRepository.getAuthenticatedMember(id);
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
  authenticatedMembers = new Array<AuthenticatedMember>();

  async getAuthenticatedMemberFromId(id: string): Promise<AuthenticatedMember | undefined> {
    return this.authenticatedMembers.find((member) => member.id === id);
  }

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    return this.members.find((member) => member.email === email)?.id;
  }
}
