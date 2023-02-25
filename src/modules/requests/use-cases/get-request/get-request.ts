import { QueryHandler } from '../../../../common/cqs/query-handler';
import { RequestRepository } from '../../request.repository';

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
