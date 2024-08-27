import { defined, hasProperty, unique } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { GetNotificationContext, NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventCommentCreated } from '../event-events';

type Member = typeof schema.members.$inferSelect;
type Event = typeof schema.events.$inferSelect;
type Comment = typeof schema.comments.$inferSelect;

export class NotifyEventCommentCreated implements EventHandler<EventCommentCreated> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.database, TOKENS.notificationService);

  constructor(
    private readonly translation: TranslationPort,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
  ) {}

  async handle({ entityId: eventId, commentId, authorId }: EventCommentCreated): Promise<void> {
    const event = defined(
      await this.database.db.query.events.findFirst({
        where: eq(schema.events.id, eventId),
        with: {
          organizer: true,
          comments: true,
          participants: true,
        },
      }),
    );

    const comment = defined(event.comments.find(hasProperty('id', commentId)));

    const author = defined(
      await this.database.db.query.members.findFirst({
        where: eq(schema.members.id, authorId),
      }),
    );

    const stakeholderIds = unique([
      event.organizer.id,
      ...event.participants.map((participant) => participant.participantId),
      ...event.comments.map((comment) => comment.authorId),
    ]);

    await this.notificationService.notify(stakeholderIds, 'EventCommentCreated', (member) =>
      this.getContext(member, event, comment, author),
    );
  }

  private getContext(
    member: Member,
    event: Event & { organizer: Member },
    comment: Comment,
    author: Member,
  ): ReturnType<GetNotificationContext<'EventCommentCreated'>> {
    if (member.id === author.id) {
      return null;
    }

    return {
      member: {
        firstName: member.firstName,
      },
      isOrganizer: event.organizer.id === member.id,
      event: {
        id: event.id,
        title: event.title,
        organizer: {
          id: event.organizer.id,
          name: this.translation.memberName(event.organizer),
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
