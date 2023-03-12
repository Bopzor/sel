import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { QueryHandler } from '../../../../common/cqs/query-handler';
import { RequestRepository } from '../../api/repositories/request.repository';
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
