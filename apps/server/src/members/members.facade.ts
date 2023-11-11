import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { Member } from './entities';
import { MembersRepository } from './members.repository';

export interface MembersFacade {
  query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined>;

  getMember(memberId: string): Promise<Member | undefined>;
  getMemberIdFromEmail(email: string): Promise<string | undefined>;
}

export class MembersFacadeImpl implements MembersFacade {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {}

  async query_getAuthenticatedMember(id: string): Promise<shared.AuthenticatedMember | undefined> {
    return this.membersRepository.query_getAuthenticatedMember(id);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return await this.membersRepository.getMember(memberId);
  }

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    const member = await this.membersRepository.getMemberFromEmail(email);

    if (member) {
      return member.id;
    }
  }
}

export class StubMembersFacade implements MembersFacade {
  authenticatedMembers = new Array<shared.AuthenticatedMember>();

  async query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined> {
    return this.authenticatedMembers.find((member) => member.id === memberId);
  }

  members = new Array<Member>();

  async getMember(memberId: string): Promise<Member | undefined> {
    return this.members.find((member) => member.id === memberId);
  }

  async getMemberIdFromEmail(email: string): Promise<string | undefined> {
    return this.members.find((member) => member.email === email)?.id;
  }
}
