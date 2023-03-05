import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { RequestRepository } from '../../request.repository';

import { ListRequestsResult } from './list-requests-result';

export type ListRequestsQuery = {
  search?: string;
};

export class ListRequestsHandler implements QueryHandler<ListRequestsQuery, ListRequestsResult> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle({ search }: ListRequestsQuery = {}): Promise<ListRequestsResult> {
    return this.requestRepository.listRequests(search);
  }
}

injected(ListRequestsHandler, TOKENS.requestRepository);
