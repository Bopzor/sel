import { Request } from '../../entities/request.entity';
import { GetRequestResult } from '../../use-cases/get-request/get-request-result';

export interface RequestRepository {
  listRequests(search?: string): Promise<GetRequestResult[]>;
  getRequest(id: string): Promise<GetRequestResult | undefined>;

  findById(id: string): Promise<Request | undefined>;
  save(request: Request): Promise<void>;
}
