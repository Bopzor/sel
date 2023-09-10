import { createDate, createFactory, createId } from '@sel/utils';

export type Request = {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  creationDate: Date;
  lastUpdateDate: Date;
};

export const createRequest = createFactory(() => ({
  id: createId(),
  requesterId: '',
  title: '',
  description: '',
  creationDate: createDate(),
  lastUpdateDate: createDate(),
}));
