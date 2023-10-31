import { AuthenticationGateway } from './authentication.gateway';

export class StubAuthenticationGateway implements AuthenticationGateway {
  requestedAuthenticationLinks = new Array<string>();

  async requestAuthenticationLink(email: string): Promise<void> {
    this.requestedAuthenticationLinks.push(email);
  }
}
