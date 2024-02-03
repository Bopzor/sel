import { InMemoryRepository } from '../../../in-memory.repository';
import { RequestAnswer } from '../../../requests/request-answer.entity';

import { RequestAnswerRepository, UpsertRequestAnswerModel } from './request-answer.repository';

export class InMemoryRequestAnswerRepository
  extends InMemoryRepository<RequestAnswer>
  implements RequestAnswerRepository
{
  async findRequestAnswer(requestId: string, memberId: string): Promise<RequestAnswer | undefined> {
    return this.find((answer) => answer.requestId === requestId && answer.memberId === memberId);
  }

  async upsert(model: UpsertRequestAnswerModel): Promise<void> {
    const existing = this.get(model.id);

    if (existing) {
      this.add({ ...existing, date: model.date, answer: model.answer });
    } else {
      this.add(model);
    }
  }

  async delete(requestAnswerId: string): Promise<void> {
    return super.delete(requestAnswerId);
  }
}
