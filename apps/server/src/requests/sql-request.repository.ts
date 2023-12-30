import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { comments, members, requests } from '../infrastructure/persistence/schema';
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
    const results = await this.db.query.requests.findMany({
      with: {
        requester: true,
        comments: {
          with: {
            author: true,
          },
        },
      },
    });

    return results.map(this.toRequest);
  }

  async query_getRequest(requestId: string): Promise<shared.Request | undefined> {
    const result = await this.db.query.requests.findFirst({
      where: eq(requests.id, requestId),
      with: {
        requester: true,
        comments: {
          with: {
            author: true,
          },
        },
      },
    });

    if (!result) {
      return undefined;
    }

    return this.toRequest(result);
  }

  private toRequest(
    this: void,
    request: typeof requests.$inferSelect & {
      requester: typeof members.$inferSelect;
      comments: Array<typeof comments.$inferSelect & { author: typeof members.$inferSelect }>;
    }
  ): shared.Request {
    const { requester, comments } = request;

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
      comments: comments.map((comment) => ({
        id: comment.id,
        date: comment.date.toISOString(),
        author: {
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          email: comment.author.emailVisible ? comment.author.email : undefined,
        },
        body: comment.html,
      })),
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
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(requestId: string, model: UpdateRequestModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.db
      .update(requests)
      .set({
        status: model.status,
        title: model.title,
        text: model.body?.text,
        html: model.body?.html,
        updatedAt: now,
      })
      .where(eq(requests.id, requestId));
  }
}
