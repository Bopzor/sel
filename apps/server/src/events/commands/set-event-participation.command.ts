import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisher } from '../../infrastructure/events/event-publisher';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventParticipationDeleted, EventParticipationSet } from '../event-events';

export type SetEventParticipationCommand = {
  eventId: string;
  memberId: string;
  participation: shared.EventParticipation | null;
};

export class SetEventParticipation implements CommandHandler<SetEventParticipationCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.database,
    TOKENS.eventPublisher,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: SetEventParticipationCommand): Promise<void> {
    const { eventId, memberId, participation } = command;
    const now = this.dateAdapter.now();

    if (participation !== null) {
      await this.database.db
        .insert(schema.eventParticipations)
        .values({
          id: this.generator.id(),
          eventId: eventId,
          participantId: memberId,
          participation: participation,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.eventParticipations.eventId, schema.eventParticipations.participantId],
          set: {
            participation: participation,
            updatedAt: now,
          },
        });

      this.eventPublisher.publish(new EventParticipationSet(eventId, participation));
    }

    if (participation === null) {
      const participation = await this.database.db.query.eventParticipations.findFirst({
        where: and(
          eq(schema.eventParticipations.eventId, eventId),
          eq(schema.eventParticipations.participantId, memberId),
        ),
      });

      if (participation) {
        await this.database.db
          .delete(schema.eventParticipations)
          .where(eq(schema.eventParticipations.id, participation.id));

        this.eventPublisher.publish(new EventParticipationDeleted(eventId));
      }
    }
  }
}
