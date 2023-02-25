import { QueryHandler } from '../../../../common/cqs/query-handler';
import { RequestRepository } from '../../request.repository';

import { ListRequestsResult } from './list-requests-result';

export type ListRequestsQuery = Record<string, never>;

export class ListRequestsHandler implements QueryHandler<ListRequestsQuery, ListRequestsResult> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle(): Promise<ListRequestsResult> {
    return this.requestRepository.listRequests();
  }
}
