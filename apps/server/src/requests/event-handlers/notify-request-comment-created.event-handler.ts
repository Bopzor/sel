import { defined, hasProperty, unique } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { GetNotificationContext, NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

type Member = typeof schema.members.$inferSelect;
type Request = typeof schema.requests.$inferSelect;
type Comment = typeof schema.comments.$inferSelect;

export class NotifyRequestCommentCreated implements EventHandler<RequestCommentCreated> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.database, TOKENS.notificationService);

  constructor(
    private readonly translation: TranslationPort,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(event: RequestCommentCreated): Promise<void> {
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

    const comment = defined(request.comments.find(hasProperty('id', event.commentId)));

    const author = defined(
      await this.database.db.query.members.findFirst({
        where: eq(schema.members.id, event.authorId),
      }),
    );

    const stakeholderIds = unique([
      request.requester.id,
      ...request.answers.map((answer) => answer.memberId),
      ...request.comments.map((comment) => comment.authorId),
    ]);

    await this.notificationService.notify(stakeholderIds, 'RequestCommentCreated', (member) =>
      this.getContext(member, request, comment, author),
    );
  }

  private getContext(
    member: Member,
    request: Request & { requester: Member },
    comment: Comment,
    author: Member,
  ): ReturnType<GetNotificationContext<'RequestCommentCreated'>> {
    if (member.id === author.id) {
      return null;
    }

    return {
      member: {
        firstName: member.firstName,
      },
      isRequester: request.requester.id === member.id,
      request: {
        id: request.id,
        title: request.title,
        requester: {
          id: request.requester.id,
          name: this.translation.memberName(request.requester),
        },
      },
      comment: {
        id: comment.id,
        author: {
          id: author.id,
          name: this.translation.memberName(author),
        },
        body: {
          html: comment.html,
          text: comment.text,
        },
      },
    };
  }
}
