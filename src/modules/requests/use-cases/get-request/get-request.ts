import { QueryHandler } from '../../../../common/cqs/query-handler';
import { assertEntity } from '../../../../common/entity-not-found.error';
import { RequestRepository } from '../../request.repository';

import { GetRequestResult } from './get-request-result';

export type GetRequestQuery = {
  id: string;
};

export class GetRequestHandler implements QueryHandler<GetRequestQuery, GetRequestResult> {
  constructor(private readonly requestRepository: RequestRepository) {}

  async handle(query: GetRequestQuery): Promise<GetRequestResult> {
    const result = await this.requestRepository.getRequest(query.id);

    assertEntity('Request', result, { id: query.id });

    return result;
  }
}
