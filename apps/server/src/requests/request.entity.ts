import { RequestStatus } from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

export { RequestStatus };

export type Request = {
  id: string;
  status: RequestStatus;
  date: Date;
  requesterId: string;
  title: string;
  body: {
    html: string;
    text: string;
  };
};

export const createRequest = createFactory<Request>(() => ({
  id: createId(),
  status: RequestStatus.pending,
  date: createDate(),
  requesterId: '',
  title: '',
  body: {
    html: '',
    text: '',
  },
}));
