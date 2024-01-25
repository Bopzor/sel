import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';

export type GetRequestQuery = {
  requestId: string;
};

export class GetRequest {
  static inject = injectableClass(this, TOKENS.requestRepository);

  constructor(private readonly requestRepository: RequestRepository) {}

  async handle({ requestId }: GetRequestQuery): Promise<shared.Request | undefined> {
    return this.requestRepository.query_getRequest(requestId);
  }
}
