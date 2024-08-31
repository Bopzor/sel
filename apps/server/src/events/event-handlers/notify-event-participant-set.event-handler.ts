import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { GetNotificationContext, NotificationService } from '../../notifications/notification.service';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventParticipationSet } from '../event-events';

type Member = typeof schema.members.$inferSelect;
type Event = typeof schema.events.$inferSelect;

export class NotifyEventParticipationSet implements EventHandler<EventParticipationSet> {
  static inject = injectableClass(this, TOKENS.translation, TOKENS.database, TOKENS.notificationService);

  constructor(
    private readonly translation: TranslationPort,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
  ) {}

  async handle({
    entityId: eventId,
    participantId,
    previousParticipation,
    participation,
  }: EventParticipationSet): Promise<void> {
    const event = defined(
      await this.database.db.query.events.findFirst({
        where: eq(schema.events.id, eventId),
        with: {
          organizer: true,
        },
      }),
    );

    const participant = defined(
      await this.database.db.query.members.findFirst({
        where: eq(schema.members.id, participantId),
      }),
    );

    await this.notificationService.notify([event.organizer.id], 'EventParticipationSet', (member) =>
      this.getContext(member, event, participant, participation, previousParticipation),
    );
  }

  private getContext(
    member: Member,
    event: Event & { organizer: Member },
    participant: Member,
    participation: shared.EventParticipation | null,
    previousParticipation: shared.EventParticipation | null,
  ): ReturnType<GetNotificationContext<'EventParticipationSet'>> {
    if (member.id !== event.organizer.id || participant.id === event.organizer.id) {
      return null;
    }

    if (participation !== 'yes' && previousParticipation !== 'yes') {
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
        },
      },
      participant: {
        id: participant.id,
        name: this.translation.memberName(participant),
      },
      previousParticipation,
      participation,
    };
  }
}
