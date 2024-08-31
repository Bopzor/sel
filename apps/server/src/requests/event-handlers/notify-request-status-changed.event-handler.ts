import { defined, unique } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { GetNotificationContext, NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { RequestCanceled, RequestFulfilled } from '../request-events';

type Member = typeof schema.members.$inferSelect;
type Request = typeof schema.requests.$inferSelect;

export class NotifyRequestStatusChanged implements EventHandler<RequestFulfilled | RequestCanceled> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.database, TOKENS.notificationService);

  constructor(
    private readonly translation: TranslationPort,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(event: RequestFulfilled | RequestCanceled): Promise<void> {
    const request = defined(
      await this.database.db.query.requests.findFirst({
        where: eq(schema.requests.id, event.entityId),
        with: {
          requester: true,
          comments: true,
          answers: { where: eq(schema.requestAnswers.answer, 'positive') },
        },
      }),
    );

    const stakeholderIds = unique([
      request.requester.id,
      ...request.answers.map((answer) => answer.memberId),
      ...request.comments.map((comment) => comment.authorId),
    ]);

    await this.notificationService.notify(stakeholderIds, 'RequestStatusChanged', (member) =>
      this.getContext(member, request),
    );
  }

  getContext(
    member: Member,
    request: Request & { requester: Member },
  ): ReturnType<GetNotificationContext<'RequestStatusChanged'>> {
    if (member.id === request.requester.id) {
      return null;
    }

    return {
      member: {
        firstName: member.firstName,
      },
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        requester: {
          id: request.requester.id,
          name: this.translation.memberName(request.requester),
        },
      },
    };
  }
}
