import { injected } from 'brandi';

import { QueryHandler } from '../../../../common/cqs/query-handler';
import { TOKENS } from '../../../../tokens';
import { RequestRepository } from '../../request.repository';
import { GetRequestResult } from '../get-request/get-request-result';

export type ListRequestsQuery = {
  search?: string;
};

export class ListRequestsHandler implements QueryHandler<ListRequestsQuery, GetRequestResult[]> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle({ search }: ListRequestsQuery = {}): Promise<GetRequestResult[]> {
    return this.requestRepository.listRequests(search);
  }
}

injected(ListRequestsHandler, TOKENS.requestRepository);
