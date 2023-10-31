import { Member } from '@sel/shared';

import { Fetcher } from '../fetcher';

import { AuthenticationGateway } from './authentication.gateway';

export class ApiAuthenticationGateway implements AuthenticationGateway {
  constructor(private readonly fetcher: Fetcher) {}

  async requestAuthenticationLink(email: string): Promise<void> {
    await this.fetcher.post(
      `/api/authentication/request-authentication-link?${new URLSearchParams({ email })}`
    );
  }

  async verifyAuthenticationToken(token: string): Promise<Member> {
    await this.fetcher.get(
      `/api/authentication/verify-authentication-token?${new URLSearchParams({ token })}`
    );

    const { body } = await this.fetcher.get<Member>('/api/session/member');

    return body;
  }
}
