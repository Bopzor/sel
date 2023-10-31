import { Fetcher } from '../fetcher';

import { AuthenticationGateway } from './authentication.gateway';

export class ApiAuthenticationGateway implements AuthenticationGateway {
  constructor(private readonly fetcher: Fetcher) {}

  async requestAuthenticationLink(email: string): Promise<void> {
    await this.fetcher.post(
      `/api/authentication/request-authentication-link?${new URLSearchParams({ email })}`
    );
  }
}
