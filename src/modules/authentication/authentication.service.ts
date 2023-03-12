import { injected } from 'brandi';

import { FRONT_TOKENS } from '../../app/front-tokens';
import { HttpClient } from '../../app/http-client';
import { Member } from '../members';

export class AuthenticationService {
  constructor(private readonly http: HttpClient) {}

  async getAuthenticatedMember(): Promise<Member | undefined> {
    const response = await this.http.get('/api/auth/me');

    if (response.status === 401) {
      return;
    }

    if (!response.ok) {
      throw new Error('not ok');
    }

    const member = await response.json();

    return member;
  }

  async login(memberId: string): Promise<void> {
    const response = await this.http.post('/api/auth/login', { memberId });

    if (!response.ok) {
      throw new Error('not ok');
    }
  }
}

injected(AuthenticationService, FRONT_TOKENS.httpClient);
