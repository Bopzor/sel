import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { QueryHandler } from '../../../../common/cqs/query-handler';
import { RequestRepository } from '../../api/repositories/request.repository';

import { GetRequestResult } from './get-request-result';

export type GetRequestQuery = {
  id: string;
};

export class GetRequestHandler implements QueryHandler<GetRequestQuery, GetRequestResult | undefined> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle(query: GetRequestQuery): Promise<GetRequestResult | undefined> {
    return this.requestRepository.getRequest(query.id);
  }
}

injected(GetRequestHandler, TOKENS.requestRepository);
