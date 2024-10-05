import {
  AddInterestMemberBody,
  CreateInterestBodySchema,
  EditInterestMemberBody,
  Interest,
} from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface InterestApi {
  listInterests(): Promise<Interest[]>;
  joinInterest(interestId: string, description?: string): Promise<void>;
  leaveInterest(interestId: string): Promise<void>;
  editMemberInterestDescription(interestId: string, description?: string): Promise<void>;
  createInterest(label: string, description: string): Promise<string>;
}

export class FetchInterestApi implements InterestApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  listInterests(): Promise<Interest[]> {
    return this.fetcher.get<Interest[]>('/interests').body();
  }

  async joinInterest(interestId: string, description?: string): Promise<void> {
    await this.fetcher.put<AddInterestMemberBody, void>(`/interests/${interestId}/join`, {
      description,
    });
  }

  async leaveInterest(interestId: string): Promise<void> {
    await this.fetcher.put<void, void>(`/interests/${interestId}/leave`);
  }

  async editMemberInterestDescription(interestId: string, description?: string): Promise<void> {
    await this.fetcher.put<EditInterestMemberBody, void>(`/interests/${interestId}/edit`, {
      description,
    });
  }

  async createInterest(label: string, description: string): Promise<string> {
    return this.fetcher
      .post<CreateInterestBodySchema, string>('/interests', {
        label,
        description,
      })
      .body();
  }
}

export class StubInterestApi implements InterestApi {
  interests = new Array<Interest>();

  async listInterests(): Promise<Interest[]> {
    return this.interests;
  }

  async joinInterest(): Promise<void> {}

  async leaveInterest(): Promise<void> {}

  async editMemberInterestDescription(): Promise<void> {}

  async createInterest(): Promise<string> {
    return '';
  }
}
