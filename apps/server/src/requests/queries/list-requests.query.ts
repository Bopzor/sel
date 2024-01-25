import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';

export class ListRequests {
  static inject = injectableClass(this, TOKENS.requestRepository);

  constructor(private readonly requestRepository: RequestRepository) {}

  async handle(): Promise<shared.Request[]> {
    return this.requestRepository.query_listRequests();
  }
}
