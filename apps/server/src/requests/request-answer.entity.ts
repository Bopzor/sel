export type RequestAnswer = {
  id: string;
  requestId: string;
  memberId: string;
  date: Date;
  answer: 'positive' | 'negative';
};
