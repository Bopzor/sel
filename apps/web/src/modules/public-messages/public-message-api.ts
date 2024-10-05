import { PublicMessage } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface PublicMessageApi {
  listPublicMessages(): Promise<{ pin: PublicMessage[]; notPin: PublicMessage[] }>;
  createPublicMessage(body: string): Promise<string>;
}

export class FetchPublicMessageApi implements PublicMessageApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  listPublicMessages(): Promise<{ pin: PublicMessage[]; notPin: PublicMessage[] }> {
    return this.fetcher.get<{ pin: PublicMessage[]; notPin: PublicMessage[] }>('/api/public-messages').body();
  }

  createPublicMessage(body: string): Promise<string> {
    return this.fetcher.post<{ body: string }, string>('/api/public-messages', { body }).body();
  }
}

export class StubPublicMessageApi implements PublicMessageApi {
  async listPublicMessages(): Promise<{ pin: PublicMessage[]; notPin: PublicMessage[] }> {
    return { pin: [], notPin: [] };
  }

  async createPublicMessage(): Promise<string> {
    return '';
  }
}
