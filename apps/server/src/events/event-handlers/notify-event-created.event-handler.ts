import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { GetNotificationContext, NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventCreated } from '../event-events';

type Member = typeof schema.members.$inferSelect;
type Event = typeof schema.events.$inferSelect;

export class NotifyEventCreated implements EventHandler<EventCreated> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.database, TOKENS.notificationService);

  constructor(
    private readonly translation: TranslationPort,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
  ) {}

  async handle({ entityId: eventId }: EventCreated): Promise<void> {
    const event = defined(
      await this.database.db.query.events.findFirst({
        where: eq(schema.events.id, eventId),
        with: {
          organizer: true,
          participants: true,
        },
      }),
    );

    await this.notificationService.notify(null, 'EventCreated', (member) => this.getContext(member, event));
  }

  private getContext(
    member: Member,
    event: Event & { organizer: Member },
  ): ReturnType<GetNotificationContext<'EventCreated'>> {
    if (member.id === event.organizer.id) {
      return null;
    }

    return {
      member: {
        firstName: member.firstName,
      },
      event: {
        id: event.id,
        title: event.title,
        organizer: {
          id: event.organizer.id,
          name: this.translation.memberName(event.organizer),
        },
        body: {
          html: event.html,
          text: event.text,
        },
      },
    };
  }
}
