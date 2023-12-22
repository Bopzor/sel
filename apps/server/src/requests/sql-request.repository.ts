import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { members, requests } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { RequestStatus } from './request.entity';
import { InsertRequestModel, RequestRepository, UpdateRequestModel } from './request.repository';

export class SqlRequestRepository implements RequestRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  async query_listRequests(): Promise<shared.Request[]> {
    const results = await this.db
      .select()
      .from(requests)
      .innerJoin(members, eq(members.id, requests.requesterId));

    return results.map(({ requests, members }) => this.toRequest(requests, members));
  }

  async query_getRequest(requestId: string): Promise<shared.Request | undefined> {
    const result = await this.db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .innerJoin(members, eq(members.id, requests.requesterId));

    if (!result[0]) {
      return undefined;
    }

    return this.toRequest(result[0].requests, result[0].members);
  }

  private toRequest(
    request: typeof requests.$inferSelect,
    requester: typeof members.$inferSelect
  ): shared.Request {
    return {
      id: request.id,
      date: request.date.toISOString(),
      requester: {
        id: requester.id,
        firstName: requester.firstName,
        lastName: requester.lastName,
        email: requester.emailVisible ? requester.email : undefined,
        phoneNumbers: (requester.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
      },
      title: request.title,
      body: request.html,
      comments: [],
    };
  }

  async insert(model: InsertRequestModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db.insert(requests).values({
      id: model.id,
      status: RequestStatus.pending,
      date: now,
      requesterId: model.requesterId,
      title: model.title,
      text: model.body.text,
      html: model.body.html,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  async update(requestId: string, model: UpdateRequestModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db
      .update(requests)
      .set({
        status: model.status,
        title: model.title,
        text: model.body.text,
        html: model.body.html,
        updatedAt: now.toISOString(),
      })
      .where(eq(requests.id, requestId));
  }
}
