import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { Request } from '../../index';
import { RequestRepository } from '../../request.repository';

export type ListRequestsQuery = {
  search?: string;
};

export class ListRequestsHandler implements QueryHandler<ListRequestsQuery, Request[]> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle({ search }: ListRequestsQuery = {}): Promise<Request[]> {
    return this.requestRepository.listRequests(search);
  }
}

injected(ListRequestsHandler, TOKENS.requestRepository);
