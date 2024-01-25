import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';

export type GetRequestQuery = {
  requestId: string;
};

export type GetRequestQueryResult = shared.Request | undefined;

export class GetRequest implements QueryHandler<GetRequestQuery, GetRequestQueryResult> {
  static inject = injectableClass(this, TOKENS.requestRepository);

  constructor(private readonly requestRepository: RequestRepository) {}

  async handle({ requestId }: GetRequestQuery): Promise<GetRequestQueryResult> {
    return this.requestRepository.query_getRequest(requestId);
  }
}
