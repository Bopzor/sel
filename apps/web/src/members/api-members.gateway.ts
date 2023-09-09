import { Member } from '@sel/shared';

import { FetchResult, Fetcher } from '../fetcher';

import { MembersGateway } from './members.gateway';

export class ApiMembersGateway implements MembersGateway {
  constructor(private readonly fetcher: Fetcher) {}

  async listMembers(): Promise<Member[]> {
    const { body } = await this.fetcher.get<Member[]>('/api/members');
    return body;
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    try {
      const { body } = await this.fetcher.get<Member>(`/api/members/${memberId}`);
      return body;
    } catch (error) {
      if (FetchResult.is(error) && error.status === 404) {
        return undefined;
      }

      throw error;
    }
  }
}
