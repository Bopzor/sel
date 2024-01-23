import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { MemberRepository } from '../persistence/repositories/member/member.repository';
import { TOKENS } from '../tokens';

import { Member } from './entities';

export interface MembersFacade {
  query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined>;

  getMember(memberId: string): Promise<Member | undefined>;
  getMembers(memberIds: string[]): Promise<Member[]>;
  getMemberFromEmail(email: string): Promise<Member | undefined>;
}

export class MembersFacadeImpl implements MembersFacade {
  static inject = injectableClass(this, TOKENS.memberRepository);

  constructor(private readonly membersRepository: MemberRepository) {}

  async query_getAuthenticatedMember(id: string): Promise<shared.AuthenticatedMember | undefined> {
    return this.membersRepository.query_getAuthenticatedMember(id);
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    return await this.membersRepository.getMember(memberId);
  }

  async getMembers(memberIds: string[]): Promise<Member[]> {
    return await this.membersRepository.getMembers(memberIds);
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.membersRepository.getMemberFromEmail(email);
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

  async getMembers(memberIds: string[]): Promise<Member[]> {
    return this.members.filter((member) => memberIds.includes(member.id));
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    return this.members.find((member) => member.email === email);
  }
}
