import { injected } from 'brandi';

import { FRONT_TOKENS } from '../../app/front-tokens';
import { HttpClient } from '../../app/http-client';

import { Member } from './index';

export class MembersService {
  constructor(private readonly http: HttpClient) {}

  async listMembers(search?: string): Promise<Member[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await this.http.get(`/api/members?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const members = await response.json();

    return members;
  }

  async getMember(memberId: string): Promise<Member> {
    const response = await this.http.get(`/api/members/${memberId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const member = await response.json();

    return member;
  }
}

injected(MembersService, FRONT_TOKENS.httpClient);
