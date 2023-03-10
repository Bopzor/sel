import { Request } from '../entities/request.entity';
import { Request as RequestResult } from '../index';

export interface RequestRepository {
  listRequests(search?: string): Promise<RequestResult[]>;
  getRequest(id: string): Promise<RequestResult | undefined>;

  findById(id: string): Promise<Request | undefined>;
  save(request: Request): Promise<void>;
}
