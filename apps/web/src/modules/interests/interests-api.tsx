import { Interest } from '@sel/shared';
import { injectableClass } from 'ditox';

export interface InterestApi {
  listInterests(): Promise<Interest[]>;
}

export class FetchInterestApi implements InterestApi {
  static inject = injectableClass(this);

  listInterests(): Promise<Interest[]> {
    throw new Error('Method not implemented.');
  }
}

export class StubInterestApi implements InterestApi {
  interests = new Array<Interest>();

  async listInterests(): Promise<Interest[]> {
    return this.interests;
  }
}
