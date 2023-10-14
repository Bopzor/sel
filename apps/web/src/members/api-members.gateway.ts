import { Member, MembersSort } from '@sel/shared';

import { FetchResult, Fetcher } from '../fetcher';

import { MembersGateway } from './members.gateway';

export class ApiMembersGateway implements MembersGateway {
  constructor(private readonly fetcher: Fetcher) {}

  async listMembers(sort?: MembersSort): Promise<Member[]> {
    let endpoint = '/api/members';
    const search = new URLSearchParams();

    if (sort) {
      search.set('sort', sort);
    }

    if (search.size > 0) {
      endpoint += `?${search}`;
    }

    const { body } = await this.fetcher.get<Member[]>(endpoint);

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
