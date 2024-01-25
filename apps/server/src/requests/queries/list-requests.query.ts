import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';

export type ListRequestsQueryResult = shared.Request[];

export class ListRequests implements QueryHandler<never, ListRequestsQueryResult> {
  static inject = injectableClass(this, TOKENS.requestRepository);

  constructor(private readonly requestRepository: RequestRepository) {}

  async handle(): Promise<ListRequestsQueryResult> {
    return this.requestRepository.query_listRequests();
  }
}
