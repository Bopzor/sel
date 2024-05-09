import { Interest } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface InterestApi {
  listInterests(): Promise<Interest[]>;
}

export class FetchInterestApi implements InterestApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  listInterests(): Promise<Interest[]> {
    return this.fetcher.get<Interest[]>('/api/interests').body();
  }
}

export class StubInterestApi implements InterestApi {
  interests = new Array<Interest>();

  async listInterests(): Promise<Interest[]> {
    return this.interests;
  }
}
