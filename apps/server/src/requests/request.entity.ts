import { createDate, createFactory, createId } from '@sel/utils';

export enum RequestStatus {
  pending = 'pending',
  fulfilled = 'fulfilled',
  canceled = 'canceled',
}

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
