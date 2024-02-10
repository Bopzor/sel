import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { desc, eq, sql } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { Request, RequestStatus } from '../../../requests/request.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { comments, members, requestAnswers, requests } from '../../schema';

import { InsertRequestModel, RequestRepository, UpdateRequestModel } from './request.repository';

export class SqlRequestRepository implements RequestRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(
    private database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  private get db() {
    return this.database.db;
  }

  async query_listRequests(): Promise<shared.Request[]> {
    const results = await this.db.query.requests.findMany({
      extras: {
        position: sql`case status when 'pending' then 1 else 2 end`.as('position'),
      },
      with: {
        requester: true,
        answers: {
          with: {
            member: true,
          },
        },
        comments: {
          with: {
            author: true,
          },
        },
      },
      orderBy: [sql`position`, desc(requests.createdAt)],
    });

    return results.map(this.toRequest);
  }

  async query_getRequest(requestId: string): Promise<shared.Request | undefined> {
    const result = await this.db.query.requests.findFirst({
      where: eq(requests.id, requestId),
      with: {
        requester: true,
        answers: {
          with: {
            member: true,
          },
        },
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
      answers: Array<typeof requestAnswers.$inferSelect & { member: typeof members.$inferSelect }>;
    },
  ): shared.Request {
    const { requester, comments, answers } = request;

    return {
      id: request.id,
      status: request.status,
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
      answers: answers.map((answer) => ({
        id: answer.id,
        member: {
          id: answer.member.id,
          firstName: answer.member.firstName,
          lastName: answer.member.lastName,
        },
        answer: answer.answer,
      })),
      comments: comments.map((comment) => ({
        id: comment.id,
        date: comment.date.toISOString(),
        author: {
          id: comment.author.id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
        },
        body: comment.html,
      })),
    };
  }

  async getRequest(requestId: string): Promise<Request | undefined> {
    const [result] = await this.db.select().from(requests).where(eq(requests.id, requestId));

    if (!result) {
      return;
    }

    return {
      id: result.id,
      status: result.status,
      date: result.date,
      requesterId: result.requesterId,
      title: result.title,
      body: {
        html: result.html,
        text: result.text,
      },
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
