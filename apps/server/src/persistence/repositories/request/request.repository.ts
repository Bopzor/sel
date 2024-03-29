import * as shared from '@sel/shared';

import { Request, RequestStatus } from '../../../requests/request.entity';

export type InsertRequestModel = {
  id: string;
  date: Date;
  requesterId: string;
  title: string;
  body: {
    text: string;
    html: string;
  };
};

export type UpdateRequestModel = {
  status?: RequestStatus;
  title?: string;
  body?: {
    text: string;
    html: string;
  };
};

export interface RequestRepository {
  query_listRequests(): Promise<shared.Request[]>;
  query_getRequest(requestId: string): Promise<shared.Request | undefined>;

  getRequest(requestId: string): Promise<Request | undefined>;
  insert(model: InsertRequestModel): Promise<void>;
  update(requestId: string, model: UpdateRequestModel): Promise<void>;
}
