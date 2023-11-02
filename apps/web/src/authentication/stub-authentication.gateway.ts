import { Member } from '@sel/shared';

import { AuthenticationGateway } from './authentication.gateway';

export class StubAuthenticationGateway implements AuthenticationGateway {
  authenticatedMember?: Member;

  async getAuthenticatedMember(): Promise<Member | undefined> {
    return this.authenticatedMember;
  }

  requestedAuthenticationLinks = new Array<string>();

  async requestAuthenticationLink(email: string): Promise<void> {
    this.requestedAuthenticationLinks.push(email);
  }

  tokenMembersMap = new Map<string, Member>();

  async verifyAuthenticationToken(token: string): Promise<Member> {
    const member = this.tokenMembersMap.get(token);

    if (!member) {
      throw new Error('invalid authentication token');
    }

    return member;
  }
}
