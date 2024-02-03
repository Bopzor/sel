import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { RequestAnswer } from '../../../requests/request-answer.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { requestAnswers } from '../../schema';

import { RequestAnswerRepository, UpsertRequestAnswerModel } from './request-answer.repository';

export class SqlRequestAnswerRepository implements RequestAnswerRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  async findRequestAnswer(requestId: string, memberId: string): Promise<RequestAnswer | undefined> {
    const [result] = await this.db
      .select()
      .from(requestAnswers)
      .where(and(eq(requestAnswers.requestId, requestId), eq(requestAnswers.memberId, memberId)));

    return result;
  }

  async upsert(model: UpsertRequestAnswerModel): Promise<void> {
    await this.db
      .insert(requestAnswers)
      .values({ ...model, createdAt: this.dateAdapter.now(), updatedAt: this.dateAdapter.now() })
      .onConflictDoUpdate({
        target: requestAnswers.id,
        set: { answer: model.answer, date: model.date, updatedAt: this.dateAdapter.now() },
      });
  }

  async delete(requestAnswerId: string): Promise<void> {
    await this.db.delete(requestAnswers).where(eq(requestAnswers.id, requestAnswerId));
  }
}
