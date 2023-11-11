import { UpdateMemberProfileData } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../fetcher';
import { TOKENS } from '../tokens';

import { MemberProfileGateway } from './member-profile.gateway';

export class ApiMemberProfileGateway implements MemberProfileGateway {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async updateMemberProfile(memberId: string, data: UpdateMemberProfileData): Promise<void> {
    await this.fetcher.put(`/api/members/${memberId}/profile`, data);
  }
}
