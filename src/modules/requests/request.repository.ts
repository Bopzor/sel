import { Request } from './entities/request.entity';
import { GetRequestResult } from './use-cases/get-request/get-request-result';
import { ListRequestsResult } from './use-cases/list-requests/list-requests-result';

export interface RequestRepository {
  listRequests(): Promise<ListRequestsResult>;
  getRequest(id: string): Promise<GetRequestResult | undefined>;

  findById(id: string): Promise<Request | undefined>;
  save(request: Request): Promise<void>;
}
