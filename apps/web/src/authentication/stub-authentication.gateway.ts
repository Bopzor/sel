import { AuthenticatedMember } from '@sel/shared';

import { AuthenticationGateway } from './authentication.gateway';

export class StubAuthenticationGateway implements AuthenticationGateway {
  authenticatedMember?: AuthenticatedMember;

  async getAuthenticatedMember(): Promise<AuthenticatedMember | undefined> {
    return this.authenticatedMember;
  }

  requestedAuthenticationLinks = new Array<string>();

  async requestAuthenticationLink(email: string): Promise<void> {
    this.requestedAuthenticationLinks.push(email);
  }

  authenticationTokens = new Set<string>();

  async verifyAuthenticationToken(token: string): Promise<void> {
    if (!this.authenticationTokens.has(token)) {
      throw new Error('invalid authentication token');
    }
  }
}
