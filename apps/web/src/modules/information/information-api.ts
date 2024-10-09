import { createInformationBodySchema, Information } from '@sel/shared';
import { injectableClass } from 'ditox';
import { z } from 'zod';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface InformationApi {
  listInformation(): Promise<{ pin: Information[]; notPin: Information[] }>;
  createInformation(body: string, isPin?: boolean): Promise<string>;
}

export class FetchInformationApi implements InformationApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  listInformation(): Promise<{ pin: Information[]; notPin: Information[] }> {
    return this.fetcher.get<{ pin: Information[]; notPin: Information[] }>('/api/information').body();
  }

  createInformation(body: string, isPin?: boolean): Promise<string> {
    return this.fetcher
      .post<z.infer<typeof createInformationBodySchema>, string>('/api/information', { body, isPin })
      .body();
  }
}

export class StubInformationApi implements InformationApi {
  async listInformation(): Promise<{ pin: Information[]; notPin: Information[] }> {
    return { pin: [], notPin: [] };
  }

  async createInformation(): Promise<string> {
    return '';
  }
}
