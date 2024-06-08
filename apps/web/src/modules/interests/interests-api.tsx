import { AddInterestMemberBody, Interest } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface InterestApi {
  listInterests(): Promise<Interest[]>;
  joinInterest(interestId: string, description?: string): Promise<void>;
  leaveInterest(interestId: string, description?: string): Promise<void>;
}

export class FetchInterestApi implements InterestApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  listInterests(): Promise<Interest[]> {
    return this.fetcher.get<Interest[]>('/api/interests').body();
  }

  async joinInterest(interestId: string, description?: string): Promise<void> {
    await this.fetcher.put<AddInterestMemberBody, void>(`/api/interests/${interestId}/join`, {
      description,
    });
  }

  async leaveInterest(interestId: string): Promise<void> {
    await this.fetcher.put<void, void>(`/api/interests/${interestId}/leave`);
  }
}

export class StubInterestApi implements InterestApi {
  interests = new Array<Interest>();

  async listInterests(): Promise<Interest[]> {
    return this.interests;
  }

  async joinInterest(): Promise<void> {}

  async leaveInterest(): Promise<void> {}
}
