import { RequestAnswer } from '../../../requests/request-answer.entity';

export type UpsertRequestAnswerModel = {
  id: string;
  requestId: string;
  memberId: string;
  date: Date;
  answer: RequestAnswer['answer'];
};

export interface RequestAnswerRepository {
  findRequestAnswer(requestId: string, memberId: string): Promise<RequestAnswer | undefined>;
  upsert(model: UpsertRequestAnswerModel): Promise<void>;
  delete(requestAnswerId: string): Promise<void>;
}
