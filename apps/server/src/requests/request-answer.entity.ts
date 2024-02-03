import { createDate, createFactory, createId } from '@sel/utils';

export type RequestAnswer = {
  id: string;
  requestId: string;
  memberId: string;
  date: Date;
  answer: 'positive' | 'negative';
};

export const createRequestAnswer = createFactory<RequestAnswer>(() => ({
  id: createId(),
  requestId: '',
  memberId: '',
  date: createDate(),
  answer: 'positive',
}));
